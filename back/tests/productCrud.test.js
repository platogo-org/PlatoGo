const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');

// App & Models
const app = require('../app');
const Product = require('../models/productModel');
const Restaurant = require('../models/RestaurantModel');
const User = require('../models/userModel');

// Helpers
let mongoServer;
let restaurant;
let adminUser;
let ownerUser;
let adminToken;

// Generate JWT (reuse env secret)
function sign(user) {
	return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

jest.setTimeout(15000);

beforeAll(async () => {
	mongoServer = await MongoMemoryServer.create();
	const uri = mongoServer.getUri();
	await mongoose.connect(uri);

		// Owner user (propietario del restaurante)
		ownerUser = await User.create({
			name: 'Owner',
			email: 'owner@test.com',
			role: 'user',
			password: 'password123',
			passwordConfirm: 'password123'
		});
		// Crear restaurante base cumpliendo campos obligatorios
		restaurant = await Restaurant.create({ 
			nombre: 'Rest Uno', 
			direccion: 'Calle 1',
			horario: new Date(),
			usuario: ownerUser._id
		});
		// Usuario admin restaurante (restaurant-admin) asociado al restaurante
		adminUser = await User.create({
			name: 'Admin',
			email: 'admin@test.com',
			role: 'restaurant-admin',
			password: 'password123',
			passwordConfirm: 'password123',
			restaurant: restaurant._id
		});
	adminToken = sign(adminUser);
		await Product.syncIndexes();
});

afterAll(async () => {
	await mongoose.connection.dropDatabase();
	await mongoose.connection.close();
	await mongoServer.stop();
});

afterEach(async () => {
	await Product.deleteMany();
});

describe('Product CRUD API', () => {
	describe('CREATE /api/v1/product', () => {
		test('crea producto válido (201)', async () => {
			const res = await request(app)
				.post('/api/v1/product')
				.set('Authorization', `Bearer ${adminToken}`)
				.send({ nombre: 'Pizza', costo: 100, restaurant: restaurant._id });
			expect(res.status).toBe(201);
			expect(res.body.data.data.nombre).toBe('Pizza');
			expect(res.body.data.data.costo).toBe(100);
			expect(res.body.data.data.restaurant).toBe(String(restaurant._id));
		});

		test('falla si falta nombre (400)', async () => {
			const res = await request(app)
				.post('/api/v1/product')
				.set('Authorization', `Bearer ${adminToken}`)
				.send({ costo: 10, restaurant: restaurant._id });
			expect(res.status).toBe(400);
		});

		test('falla si falta costo (400)', async () => {
			const res = await request(app)
				.post('/api/v1/product')
				.set('Authorization', `Bearer ${adminToken}`)
				.send({ nombre: 'Hamburguesa', restaurant: restaurant._id });
			expect(res.status).toBe(400);
		});

		test('falla si costo negativo (400)', async () => {
			const res = await request(app)
				.post('/api/v1/product')
				.set('Authorization', `Bearer ${adminToken}`)
				.send({ nombre: 'Refresco', costo: -5, restaurant: restaurant._id });
			expect(res.status).toBe(400);
		});

		test('falla si falta restaurant (400)', async () => {
			const res = await request(app)
				.post('/api/v1/product')
				.set('Authorization', `Bearer ${adminToken}`)
				.send({ nombre: 'Taco', costo: 25 });
			expect(res.status).toBe(400);
		});

			test('falla si producto duplicado (400)', async () => {
				await request(app)
					.post('/api/v1/product')
					.set('Authorization', `Bearer ${adminToken}`)
					.send({ nombre: 'Duplicado', costo: 15, restaurant: restaurant._id });
				const res2 = await request(app)
					.post('/api/v1/product')
					.set('Authorization', `Bearer ${adminToken}`)
					.send({ nombre: 'Duplicado', costo: 20, restaurant: restaurant._id });
				expect([400,409]).toContain(res2.status); // según errorController devuelve 400
			});
	});

	describe('READ list & single', () => {
		test('lista productos activos (200) y omite inactivos', async () => {
			await Product.create({ nombre: 'Activo', costo: 10, restaurant: restaurant._id });
			await Product.create({ nombre: 'Inactivo', costo: 5, restaurant: restaurant._id, active: false });
			const res = await request(app)
				.get('/api/v1/product')
				.set('Authorization', `Bearer ${adminToken}`);
			expect(res.status).toBe(200);
			const names = res.body.data.data.map(p => p.nombre);
			expect(names).toContain('Activo');
			expect(names).not.toContain('Inactivo');
		});

		test('obtiene un producto por id (200)', async () => {
			const prod = await Product.create({ nombre: 'Unitario', costo: 15, restaurant: restaurant._id });
			const res = await request(app)
				.get(`/api/v1/product/${prod._id}`)
				.set('Authorization', `Bearer ${adminToken}`);
			expect(res.status).toBe(200);
			expect(res.body.data.data.nombre).toBe('Unitario');
		});

		test('retorna 404 para id inexistente', async () => {
			const fakeId = new mongoose.Types.ObjectId();
			const res = await request(app)
				.get(`/api/v1/product/${fakeId}`)
				.set('Authorization', `Bearer ${adminToken}`);
			expect(res.status).toBe(404);
		});
	});

	describe('UPDATE /api/v1/product/:id', () => {
		test('actualiza costo y nombre (200)', async () => {
			const prod = await Product.create({ nombre: 'Original', costo: 30, restaurant: restaurant._id });
			const res = await request(app)
				.patch(`/api/v1/product/${prod._id}`)
				.set('Authorization', `Bearer ${adminToken}`)
				.send({ nombre: 'Modificado', costo: 35 });
			expect(res.status).toBe(200);
			expect(res.body.data.data.nombre).toBe('Modificado');
			expect(res.body.data.data.costo).toBe(35);
		});

		test('retorna 404 al actualizar id inexistente', async () => {
			const fakeId = new mongoose.Types.ObjectId();
			const res = await request(app)
				.patch(`/api/v1/product/${fakeId}`)
				.set('Authorization', `Bearer ${adminToken}`)
				.send({ nombre: 'Nada' });
			expect(res.status).toBe(404);
		});
	});

	describe('SOFT DELETE /api/v1/product/:id', () => {
		test('marca producto como inactivo (204) y no aparece luego en listado', async () => {
			const prod = await Product.create({ nombre: 'Eliminar', costo: 50, restaurant: restaurant._id });
			const resDel = await request(app)
				.delete(`/api/v1/product/${prod._id}`)
				.set('Authorization', `Bearer ${adminToken}`);
			expect(resDel.status).toBe(204);
			expect(resDel.body).toEqual({});

			const resList = await request(app)
				.get('/api/v1/product')
				.set('Authorization', `Bearer ${adminToken}`);
			const ids = resList.body.data.data.map(p => p._id);
			expect(ids).not.toContain(String(prod._id));
		});

		test('retorna 404 al eliminar id inexistente', async () => {
			const fakeId = new mongoose.Types.ObjectId();
			const res = await request(app)
				.delete(`/api/v1/product/${fakeId}`)
				.set('Authorization', `Bearer ${adminToken}`);
			expect(res.status).toBe(404);
		});

		test('retorna 500 ante error interno simulado', async () => {
				const original = Product.findByIdAndUpdate;
				Product.findByIdAndUpdate = async () => { return Promise.reject(new Error('Simulated failure')); };
				const prod = await Product.create({ nombre: 'Temp', costo: 10, restaurant: restaurant._id });
				const res = await request(app)
					.delete(`/api/v1/product/${prod._id}`)
					.set('Authorization', `Bearer ${adminToken}`);
				Product.findByIdAndUpdate = original; // restore
				expect(res.status).toBe(500);
		});
	});
});
