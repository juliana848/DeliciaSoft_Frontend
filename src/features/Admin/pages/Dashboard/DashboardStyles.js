// DashboardStyles.js - OPTIMIZADO SIN ESPACIOS EXCESIVOS

export const styles = {
  dashboard: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#ffffff',
    minHeight: '70vh',
    maxHeight: '70vh',
    padding: '8px',
    color: '#333',
    overflow: 'hidden'
  },
  container: {
    maxWidth: '100%',
    margin: '0 auto',
    padding: '0 8px',
    height: 'calc(100vh - 16px)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#333',
    marginTop: '0'
  },
  mainContent: {
    display: 'flex',
    gap: '10px',
    marginBottom: '0',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    flexDirection: 'row-reverse',
    flex: 1,
    overflow: 'hidden'
  },
  leftSection: {
    flex: '1.8',
    minWidth: '500px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '0',
    order: 2
  },
  rightSection: {
    flex: '1',
    minWidth: '320px',
    maxWidth: '380px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    order: 1
  },
  statsRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '0',
    flexWrap: 'wrap',
    alignItems: 'stretch'
  },
  statCard: {
    background: 'white',
    borderRadius: '8px',
    padding: '10px',
    flex: '1',
    minWidth: '140px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  statTitle: {
    fontSize: '9px',
    color: '#666',
    marginBottom: '3px',
    fontWeight: '400',
    textTransform: 'uppercase',
    letterSpacing: '0.3px'
  },
  statValue: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '4px',
    lineHeight: '1'
  },
  statChange: {
    fontSize: '9px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    color: '#666',
    marginBottom: '3px'
  },
  statSubInfo: {
    fontSize: '8px',
    color: '#999',
    marginTop: '2px'
  },
  statProgress: {
    position: 'absolute',
    bottom: '0',
    left: '0',
    right: '0',
    height: '3px',
    borderRadius: '0 0 8px 8px',
    overflow: 'hidden'
  },
  progressBarVentas: {
    height: '100%',
    background: 'linear-gradient(90deg, #FF1493 0%, #FF69B4 100%)',
    width: '78%'
  },
  progressBarCompras: {
    height: '100%',
    background: 'linear-gradient(90deg,rgb(238, 76, 233) 0%,rgb(244, 90, 218) 100%)',
    width: '65%'
  },
  realtimeCard: {
    background: 'white',
    borderRadius: '8px',
    padding: '10px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    height: '200px',
    display: 'flex',
    flexDirection: 'column'
  },
  tortaCard: {
    background: 'white',
    borderRadius: '8px',
    padding: '10px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    height: '190px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  tortaCardExpanded: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'white',
    borderRadius: '10px',
    padding: '25px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    zIndex: 1000,
    width: '550px',
    maxWidth: '90vw',
    maxHeight: '90vh',
    overflow: 'auto'
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999
  },
  realtimeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    flexWrap: 'wrap',
    gap: '6px'
  },
  tortaHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    flexWrap: 'wrap',
    gap: '6px'
  },
  realtimeTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#333',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  tortaTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#333'
  },
  liveIndicator: {
    width: '5px',
    height: '5px',
    backgroundColor: '#4CAF50',
    borderRadius: '50%',
    animation: 'pulse 2s infinite'
  },
  sedeSelector: {
    padding: '3px 6px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '9px',
    backgroundColor: 'white',
    cursor: 'pointer'
  },
  sedeFilterCard: {
    background: 'white',
    borderRadius: '8px',
    padding: '10px',
    minWidth: '140px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  tortaControls: {
    display: 'flex',
    gap: '5px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  ventasList: {
    flex: 1,
    overflowY: 'auto',
    paddingRight: '3px',
    minHeight: '140px'
  },
  ventaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px',
    borderBottom: '1px solid #f0f0f0',
    transition: 'background-color 0.3s ease'
  },
  ventaImagen: {
    width: '30px',
    height: '30px',
    borderRadius: '4px',
    objectFit: 'cover'
  },
  ventaInfo: {
    flex: '1',
    minWidth: '0'
  },
  ventaNombre: {
    fontSize: '10px',
    fontWeight: '500',
    color: '#333',
    marginBottom: '2px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  ventaDetalles: {
    fontSize: '8px',
    color: '#666',
    display: 'flex',
    gap: '5px'
  },
  ventaPrecio: {
    fontSize: '10px',
    fontWeight: 'bold',
    color: '#FF1493',
    textAlign: 'right'
  },
  sedeTag: {
    fontSize: '7px',
    padding: '2px 4px',
    borderRadius: '6px',
    fontWeight: '500'
  },
  sedeSanPablo: {
    backgroundColor: '#FF1493',
    color: 'white'
  },
  sedeSanBenito: {
    backgroundColor: '#4CAF50',
    color: 'white'
  },
  chartCard: {
    background: 'white',
    borderRadius: '8px',
    padding: '12px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    height: '270px',
    display: 'flex',
    flexDirection: 'column'
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    flexWrap: 'wrap',
    gap: '8px'
  },
  chartTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#333'
  },
  controlsContainer: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  selectorContainer: {
    display: 'flex',
    gap: '3px'
  },
  selectorButton: {
    padding: '4px 8px',
    border: '1px solid #ddd',
    backgroundColor: 'white',
    color: '#666',
    fontSize: '9px',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'all 0.2s'
  },
  selectorButtonActive: {
    padding: '4px 8px',
    border: '1px solid #FF1493',
    backgroundColor: '#FF1493',
    color: 'white',
    fontSize: '9px',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'all 0.2s'
  },
  toggleContainer: {
    display: 'flex',
    gap: '5px',
    alignItems: 'center'
  },
  toggleButton: {
    padding: '3px 6px',
    border: '1px solid #ddd',
    backgroundColor: 'white',
    color: '#666',
    fontSize: '8px',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '3px'
  },
  toggleButtonActive: {
    padding: '3px 6px',
    border: '1px solid #FF1493',
    backgroundColor: '#FF1493',
    color: 'white',
    fontSize: '8px',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '3px'
  },
  toggleButtonCompras: {
    padding: '3px 6px',
    border: '1px solid #ddd',
    backgroundColor: 'white',
    color: '#666',
    fontSize: '8px',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '3px'
  },
  toggleButtonComprasActive: {
    padding: '3px 6px',
    border: '1px solid #A9A9A9',
    backgroundColor: '#A9A9A9',
    color: 'white',
    fontSize: '8px',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '3px'
  },
  colorIndicator: {
    width: '5px',
    height: '5px',
    borderRadius: '50%'
  },
  expandButton: {
    padding: '3px 6px',
    border: '1px solid #ddd',
    backgroundColor: 'white',
    color: '#666',
    fontSize: '8px',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'all 0.2s'
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#666'
  },
};

export const globalStyles = `
  body {
    overflow: hidden;
  }
  
  @keyframes pulse { 
    0% { opacity: 1; } 
    50% { opacity: 0.5; } 
    100% { opacity: 1; } 
  }
  @keyframes slideIn { 
    from { 
      opacity: 0; 
      transform: translateY(-20px); 
      background-color: rgba(255, 20, 147, 0.1);
    } 
    to { 
      opacity: 1; 
      transform: translateY(0);
      background-color: transparent;
    } 
  }
  @keyframes spin { 
    0% { transform: rotate(0deg); } 
    100% { transform: rotate(360deg); } 
  }
  .loading-spinner {
    width: 28px;
    height: 28px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #FF1493;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  .venta-nueva {
    animation: slideIn 0.5s ease-out;
  }
`;