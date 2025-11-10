import React, { useState, useEffect, useRef } from "react";
import categoriaProductoApiService from "../../../services/categoriaProductosService";

export default function CategoriaEdit({ visible, categoria, onUpdate, onClose }) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [activo, setActivo] = useState(true);
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [previewImagen, setPreviewImagen] = useState(null);
  const [notification, setNotification] = useState({ visible: false, mensaje: "", tipo: "success" });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (categoria) {
      setNombre(categoria.nombre || "");
      setDescripcion(categoria.descripcion || "");
      setActivo(categoria.activo ?? true);
      setPreviewImagen(categoria.imagen || null);
      setArchivoImagen(null);
    }
    setNotification({ visible: false, mensaje: "", tipo: "success" });
  }, [categoria, visible]);

  const showNotification = (mensaje, tipo = "success") => setNotification({ visible: true, mensaje, tipo });
  const hideNotification = () => setNotification({ visible: false, mensaje: "", tipo: "success" });

  const validar = () => {
    if (!nombre.trim()) return showNotification("El nombre es obligatorio", "error"), false;
    if (nombre.length > 20) return showNotification("El nombre no puede tener más de 20 caracteres", "error"), false;
    if (!descripcion.trim()) return showNotification("La descripción es obligatoria", "error"), false;
    if (descripcion.length > 50) return showNotification("La descripción no puede tener más de 50 caracteres", "error"), false;
    return true;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return showNotification("Archivo no válido", "error"), e.target.value = "";
    if (file.size > 5 * 1024 * 1024) return showNotification("La imagen no debe superar 5MB", "error"), e.target.value = "";
    setArchivoImagen(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewImagen(ev.target.result);
    reader.readAsDataURL(file);
  };

  const limpiarImagen = () => { setArchivoImagen(null); setPreviewImagen(null); if (fileInputRef.current) fileInputRef.current.value = ""; };

  const handleGuardar = async () => {
    if (!validar()) return;
    if (!categoria?.id) return showNotification("Categoría no cargada", "error");

    setLoading(true);
    try {
      await categoriaProductoApiService.actualizarCategoria(
        categoria.id,
        { nombre, descripcion, estado: activo },
        archivoImagen
      );
      showNotification("✅ Categoría actualizada exitosamente");
      setTimeout(() => { onUpdate && onUpdate(); onClose(); }, 1200);
    } catch (err) {
      showNotification("❌ Error al actualizar categoría: " + (err.message || err), "error");
    } finally { setLoading(false); }
  };

  if (!visible) return null;

  return (
    <div style={{ position:'fixed', top:0,left:0,right:0,bottom:0,backgroundColor:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000 }}>
      <div style={{ backgroundColor:'#fff',borderRadius:'8px',padding:'1.5rem',width:'400px',maxWidth:'90vw',maxHeight:'90vh',overflow:'auto',boxShadow:'0 4px 6px rgba(0,0,0,0.1)' }}>
        {notification.visible && (
          <div style={{ padding:'0.75rem 1rem',marginBottom:'1rem',borderRadius:'4px',backgroundColor:notification.tipo==='error'?'#fee':'#efe',color:notification.tipo==='error'?'#c33':'#363',border:`1px solid ${notification.tipo==='error'?'#fcc':'#cfc'}`,display:'flex',justifyContent:'space-between',alignItems:'center' }}>
            <span>{notification.mensaje}</span>
            <button onClick={hideNotification} style={{ background:'none',border:'none',fontSize:'1.2rem',cursor:'pointer',padding:0,lineHeight:1 }}>×</button>
          </div>
        )}

        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem',paddingBottom:'1rem',borderBottom:'2px solid #e91e63' }}>
          <h2 style={{ margin:0,fontSize:'1.5rem',fontWeight:'600' }}>Editar Categoría</h2>
          <button onClick={onClose} disabled={loading} style={{ background:'none',border:'none',fontSize:'1.5rem',cursor:'pointer',color:'#666',padding:0,lineHeight:1 }}>×</button>
        </div>

        <div>
          <div style={{ marginBottom:'1.25rem' }}>
            <label style={{ display:'block',marginBottom:'0.5rem',fontWeight:'500' }}>Nombre <span style={{ color:'red' }}>*</span></label>
            <input type="text" value={nombre} onChange={e=>setNombre(e.target.value)} maxLength={20} placeholder="Ej: Postres" style={{ width:'100%',padding:'0.5rem',border:'1px solid #ddd',borderRadius:'4px',fontSize:'0.95rem' }}/>
            <small style={{ color:'#666', fontSize:'0.85rem' }}>{nombre.length}/20 caracteres</small>
          </div>

          <div style={{ marginBottom:'1.25rem' }}>
            <label style={{ display:'block',marginBottom:'0.5rem',fontWeight:'500' }}>Descripción <span style={{ color:'red' }}>*</span></label>
            <textarea value={descripcion} onChange={e=>setDescripcion(e.target.value)} rows={3} maxLength={50} placeholder="Ej: Productos dulces y fríos" style={{ resize:'none',width:'100%',padding:'0.5rem',border:'1px solid #ddd',borderRadius:'4px',fontSize:'0.95rem',fontFamily:'inherit' }}/>
            <small style={{ color:'#666', fontSize:'0.85rem' }}>{descripcion.length}/50 caracteres</small>
          </div>

          <div style={{ marginBottom:'1.25rem' }}>
            <label style={{ display:'block',marginBottom:'0.5rem',fontWeight:'500' }}>Imagen (opcional)</label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} id="categoria-edit-upload" style={{ display:'none' }}/>
            <label htmlFor="categoria-edit-upload" style={{ display:'inline-block',padding:'0.5rem 1rem',border:'1px solid #ddd',borderRadius:'4px',cursor:'pointer',backgroundColor:'#f5f5f5',fontSize:'0.9rem' }}>Seleccionar archivo</label>
            <span style={{ marginLeft:'1rem', color:'#666', fontSize:'0.9rem' }}>{archivoImagen?archivoImagen.name:previewImagen?'Imagen actual':'Sin archivos seleccionados'}</span>

            {previewImagen && (
              <div style={{ marginTop:'1rem', display:'flex', alignItems:'center', gap:'10px' }}>
                <img src={previewImagen} alt="Preview" style={{ width:'60px', height:'60px', borderRadius:'4px', objectFit:'cover', border:'1px solid #ddd' }}/>
                <button type="button" onClick={limpiarImagen} style={{ padding:'0.35rem 0.75rem', border:'1px solid #ddd', borderRadius:'4px', cursor:'pointer', backgroundColor:'#fff', fontSize:'0.85rem' }}>Quitar</button>
              </div>
            )}
          </div>
        </div>

<div style={{ marginBottom: '1.25rem' }}>
  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
    Estado
  </label>
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '20px' }}>
      <input 
        type="checkbox" 
        checked={activo} 
        onChange={e => setActivo(e.target.checked)} 
        style={{ opacity: 0, width: 0, height: 0 }} 
      />
      <span style={{
        position: 'absolute',
        cursor: 'pointer',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: activo ? '#e91e63' : '#ccc', // ROSITA activo
        transition: '.4s',
        borderRadius: '34px'
      }} />
      <span style={{
        position: 'absolute',
        left: activo ? '20px' : '0px',
        top: '2px',
        width: '16px',
        height: '16px',
        backgroundColor: '#fff',
        borderRadius: '50%',
        transition: '.4s'
      }} />
    </label>
    <span style={{ fontWeight: '500', color: activo ? '#c2185b' : '#c62828' }}>
      {activo ? "Activo" : "Inactivo"}
    </span>
  </div>
</div>




        <div style={{ display:'flex', justifyContent:'flex-end', gap:'0.75rem', marginTop:'1.5rem', paddingTop:'1rem', borderTop:'1px solid #eee' }}>
          <button onClick={onClose} disabled={loading} style={{ padding:'0.5rem 1.5rem', border:'1px solid #ddd', borderRadius:'4px', cursor:loading?'not-allowed':'pointer', backgroundColor:'#fff', fontSize:'0.95rem', opacity:loading?0.6:1 }}>Cancelar</button>
          <button onClick={handleGuardar} disabled={loading} style={{ padding:'0.5rem 1.5rem', border:'none', borderRadius:'4px', cursor:loading?'not-allowed':'pointer', backgroundColor:'#e91e63', color:'#fff', fontSize:'0.95rem', opacity:loading?0.6:1 }}>{loading?"Guardando...":"💾 Guardar"}</button>
        </div>
      </div>
    </div>
  );
}
