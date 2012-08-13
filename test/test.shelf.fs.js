var store = require('./../build/shelf-fs.js').store,
	expect = require('expect.js'),
	path = require('path'),
	fs = require('fs');


store.type = 'fs';

// Objects
///////////

var obj_simple = {
			a: 1,
			b: 2,
			c: 3,
		};

var obj_complex = {
	a: 1,
	b: obj_simple,
	c: 3,
};

var obj_with_null = {
	a: 1,
	b: null,
	c: 3,
};

var obj_falsy = {
	a: 0,
	b: false,
	c: 3,
};

// Cycles
//////////

var base_cycle = {
		a: 1,
		b: 2,
		c: {a: 1, 
			b: {foo: 1},
			},
};

var c1 = base_cycle;
var c2 = base_cycle;

// TODO: referencing the whole object does not work.
//c1.aa = base_cycle;
c2.ac = base_cycle.c;
c2.aa = base_cycle.b;

var cycles = [c1, c2];

var filename = './shelf.out';

var deleteIfExist = function() {
	if ('undefined' !== typeof fs.existsSync) {
		if (fs.existsSync(filename)) {
			fs.unlink(filename, function (err) {
				if (err) throw err;  
			});
		}
	}
	else if (path.existsSync(this.logdir)) {
		fs.unlink(filename, function (err) {
			if (err) throw err;  
		});
	}
};

var testStoreDelete = function(d, k, v, u) {
	
	describe(d, function(){
		it('store [' + k + ': ' + v + ']', function() {
			store(k, v);
			expect(store(k)).to.eql(v);
		});
		
		it('updating key [' + k + ': ' + v + '] -> [' + k + ': ' + u + ']', function() {
			store(k, u);
			expect(store(k)).to.eql(u);
		});
		
		it('delete key [' + k + ']', function() {
			store(k, null);
			expect(store(k)).to.be.undefined;
		});
	});
};

// TEST
////////


it('store is found', function() {
	expect(store).to.exist;
});


// BEGIN
/////////

describe('Primitive types', function(){

	before(function() {
		deleteIfExist();
	});
	
	testStoreDelete('String', 'test', 'foo', 'foo2');
	
	testStoreDelete('Number', 'test-n', 1000, 100);
	
	testStoreDelete('Negative Number', 'test-n', -100, -100);
	
	testStoreDelete('Zero', 'test-zero', 0, 9);
	
});

describe('Objects', function(){
		
	before(function() {
		deleteIfExist();
	});
	
	testStoreDelete('Simple Obj', 'so', obj_simple, obj_complex);
	
	testStoreDelete('Complex Obj', 'oc', obj_complex, obj_simple);
	
	testStoreDelete('Object with Nulls', 'on', obj_with_null, obj_simple);
	
	testStoreDelete('Falsy Obj', 'of', obj_falsy, obj_simple);

});

describe('Array of Objects', function(){
		
	before(function() {
		deleteIfExist();
	});
	
	var a1 = [obj_simple, obj_complex];
	var a2 = [obj_with_null, obj_falsy];
	
	testStoreDelete('Array S-C', 'asc', a1, a2);
	
	testStoreDelete('Array N-F', 'oc', a2, a1);

});

describe('Cyclic objects', function(){
	
	before(function() {
		deleteIfExist();
	});
	after(function() {
		deleteIfExist();
	});
	it('JSON.decycle and JSON.retrocycle are found', function() {
		expect(JSON).to.exist;
		expect(JSON.decycle).to.exist;
		expect(JSON.retrocycle).to.exist;
	});
	
	testStoreDelete('Cycle', 'cycle', c1, c2);
});


