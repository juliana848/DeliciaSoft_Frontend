// tests/fixtures/clientes-data.js
// Datos de prueba para los tests de Clientes

export const clienteValido = {
  tipoDocumento: 'CC',
  numeroDocumento: '1234567890',
  nombre: 'Juan',
  apellido: 'Pérez',
  correo: 'juan.perez@test.com',
  contrasena: 'Test123!@#',
  confirmarContrasena: 'Test123!@#',
  direccion: 'Cra 51a #71-25',
  barrio: 'Laureles',
  ciudad: 'Medellín',
  fechaNacimiento: '1990-01-15',
  celular: '3001234567'
};

export const clienteInvalido = {
  numeroDocumentoConLetras: 'ABC123',
  numeroDocumentoVacio: '',
  nombreConNumeros: 'Juan123',
  apellidoConNumeros: 'Pérez456',
  correoInvalido: 'correo-invalido',
  celularConLetras: '300ABC1234',
  contrasenaCorta: 'Test1!',
  contrasenaSinMayuscula: 'test123!@#',
  contrasenaSinEspecial: 'Test123456',
  fechaMenor13: '2020-01-01',
  direccionInvalida: 'casa azul'
};

export const clienteEdicion = {
  tipoDocumento: 'CE',
  numeroDocumento: '9876543210',
  nombre: 'María',
  apellido: 'González',
  correo: 'maria.gonzalez@test.com',
  direccion: 'Calle 45 #23-12',
  barrio: 'El Poblado',
  ciudad: 'Medellín',
  fechaNacimiento: '1985-05-20',
  celular: '3109876543'
};

export const mensajesError = {
  numeroDocumentoRequerido: 'El número de documento es obligatorio.',
  nombreRequerido: 'El nombre es obligatorio.',
  apellidoRequerido: 'El apellido es obligatorio.',
  correoRequerido: 'El correo es obligatorio.',
  correoInvalido: 'Formato de correo no válido.',
  celularRequerido: 'El celular es obligatorio.',
  contrasenaRequerida: 'La contraseña es obligatoria.',
  contrasenaCorta: 'Debe tener al menos 8 caracteres.',
  contrasenaSinMayuscula: 'Debe contener al menos una letra mayúscula.',
  contrasenaSinEspecial: 'Debe contener al menos un carácter especial.',
  contrasenasNoCoinciden: 'Las contraseñas no coinciden.',
  menor13: 'El cliente debe tener al menos 13 años.',
  direccionInvalida: 'Ingrese una dirección válida',
  clienteDuplicado: 'Ya existe un cliente con este número'
};

export const mensajesExito = {
  clienteAgregado: 'Cliente agregado exitosamente',
  clienteActualizado: 'Cliente actualizado exitosamente',
  clienteEliminado: 'Cliente eliminado exitosamente',
  estadoCambiado: 'Cliente activado exitosamente'
};