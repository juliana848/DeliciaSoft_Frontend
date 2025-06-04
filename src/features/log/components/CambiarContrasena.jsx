import React,{ useState } from 'react';

const ModalCambiarContrasena = ({ onClose, onContrasenaCambiada }) => {
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [error, setError] = useState('');

  const validarContrasena = (contrasena) => {
    const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
    return regex.test(contrasena);
  };

  const manejarCambio = (e) => {
    e.preventDefault();
    setError('');

    if (nuevaContrasena !== confirmarContrasena) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (!validarContrasena(nuevaContrasena)) {
      setError("Debe tener al menos 8 caracteres, una mayúscula y un carácter especial.");
      return;
    }

    // Aquí podrías enviar la nueva contraseña a tu backend
    alert("Contraseña actualizada correctamente.");
    onContrasenaCambiada();
  };

  return (
    <div className="modalrecuperar">
      <div className="modal-contenidorecupera">
        <h2>Cambiar Contraseña</h2>
        <form onSubmit={manejarCambio}>
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={nuevaContrasena}
            onChange={(e) => setNuevaContrasena(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmarContrasena}
            onChange={(e) => setConfirmarContrasena(e.target.value)}
            required
          />
          {error && <p className="error">{error}</p>}
          <div className="botones">
            <button type="button" onClick={onClose} className="btn-enviar">Cancelar</button>
            <button type="submit" className="btn-enviar">Cambiar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCambiarContrasena;
