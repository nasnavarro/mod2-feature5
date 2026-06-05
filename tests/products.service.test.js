import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../src/services/products.service.js';

console.log('--- getAllProducts ---');
console.log((await getAllProducts()).length);                           // 15

console.log('--- getProductById ---');
console.log(await getProductById(1));                                  // producto id 1
console.log(await getProductById(999));                                // null

console.log('--- createProduct ---');
const created = await createProduct({ name: 'Test', price: 9.99 });
console.log(created);                                                  // id 16, con createdAt
console.log((await getAllProducts()).length);                           // 16

console.log('--- updateProduct ---');
console.log(await updateProduct(1, { name: 'Actualizado', price: 99 })); // producto actualizado
console.log(await updateProduct(999, { name: 'X', price: 0 }));          // null — id inexistente

console.log('--- deleteProduct ---');
console.log(await deleteProduct(1));                                   // producto eliminado
console.log(await deleteProduct(999));                                 // null — id inexistente
console.log((await getAllProducts()).length);                           // 15 (creado 1, eliminado 1)

console.log('--- nuevo producto tras borrado usa id correcto ---');
const created2 = await createProduct({ name: 'Nuevo', price: 5 });
console.log(created2.id);                                              // 17 (no reutiliza el 1 borrado)
