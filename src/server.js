import app from './app.js';

//Se asegura de que la variable de entorno JWT_SECRET esté definida antes de iniciar el servidor
if (!process.env.JWT_SECRET) {
  console.error('Error: JWT_SECRET no está definido. El servidor no puede arrancar.');
  process.exit(1);
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
