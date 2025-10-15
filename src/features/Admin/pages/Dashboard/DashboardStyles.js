export const styles = {
  dashboard: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
    padding: '15px',
    color: '#333'
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto'
  },
  header: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#333',
    marginTop: '10px'
  },
  mainContent: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
    flexWrap: 'wrap',
    alignItems: 'flex-start'
  },
  leftSection: {
    flex: '1.8',
    minWidth: '600px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginTop:'45px'
  },
  rightSection: {
    flex: '1',
    minWidth: '400px',
    maxWidth: '450px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  statsRow: {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px',
    flexWrap: 'wrap',
    alignItems: 'stretch'
  },
  statCard: {
    background: 'white',
    borderRadius: '10px',
    padding: '25px',
    flex: '1',
    minWidth: '220px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  statTitle: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '8px',
    fontWeight: '400',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '12px',
    lineHeight: '1'
  },
  statChange: {
    fontSize: '13px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    color: '#666',
    marginBottom: '8px'
  },
  statSubInfo: {
    fontSize: '11px',
    color: '#999',
    marginTop: '5px'
  },
  statProgress: {
    position: 'absolute',
    bottom: '0',
    left: '0',
    right: '0',
    height: '4px',
    borderRadius: '0 0 10px 10px',
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
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    height: '320px',
    display: 'flex',
    flexDirection: 'column'
  },
  tortaCard: {
    background: 'white',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    height: '320px',
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
    padding: '30px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    zIndex: 1000,
    width: '600px',
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
    marginBottom: '15px',
    flexWrap: 'wrap',
    gap: '10px'

  },
  tortaHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    flexWrap: 'wrap',
    gap: '10px'
  },
  realtimeTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  tortaTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333'
  },
  liveIndicator: {
    width: '8px',
    height: '8px',
    backgroundColor: '#4CAF50',
    borderRadius: '50%',
    animation: 'pulse 2s infinite'
  },
  sedeSelector: {
    padding: '6px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '12px',
    backgroundColor: 'white',
    cursor: 'pointer'
  },
  sedeFilterCard: {
    background: 'white',
    borderRadius: '10px',
    padding: '25px',
    minWidth: '220px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  tortaControls: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  ventasList: {
    flex: 1,
    overflowY: 'auto',
    paddingRight: '5px',
    minHeight: '220px'
  },
  ventaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px',
    borderBottom: '1px solid #f0f0f0',
    transition: 'background-color 0.3s ease'
  },
  ventaImagen: {
    width: '40px',
    height: '40px',
    borderRadius: '6px',
    objectFit: 'cover'
  },
  ventaInfo: {
    flex: '1',
    minWidth: '0'
  },
  ventaNombre: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#333',
    marginBottom: '2px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  ventaDetalles: {
    fontSize: '11px',
    color: '#666',
    display: 'flex',
    gap: '8px'
  },
  ventaPrecio: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#FF1493',
    textAlign: 'right'
  },
  sedeTag: {
    fontSize: '10px',
    padding: '2px 6px',
    borderRadius: '10px',
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
    borderRadius: '10px',
    padding: '25px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    height: '420px',
    display: 'flex',
    flexDirection: 'column'
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '15px'
  },
  chartTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333'
  },
  controlsContainer: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  selectorContainer: {
    display: 'flex',
    gap: '5px'
  },
  selectorButton: {
    padding: '8px 16px',
    border: '1px solid #ddd',
    backgroundColor: 'white',
    color: '#666',
    fontSize: '12px',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'all 0.2s'
  },
  selectorButtonActive: {
    padding: '8px 16px',
    border: '1px solid #FF1493',
    backgroundColor: '#FF1493',
    color: 'white',
    fontSize: '12px',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'all 0.2s'
  },
  toggleContainer: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  toggleButton: {
    padding: '6px 12px',
    border: '1px solid #ddd',
    backgroundColor: 'white',
    color: '#666',
    fontSize: '11px',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  toggleButtonActive: {
    padding: '6px 12px',
    border: '1px solid #FF1493',
    backgroundColor: '#FF1493',
    color: 'white',
    fontSize: '11px',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  toggleButtonCompras: {
    padding: '6px 12px',
    border: '1px solid #ddd',
    backgroundColor: 'white',
    color: '#666',
    fontSize: '11px',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  toggleButtonComprasActive: {
    padding: '6px 12px',
    border: '1px solid #A9A9A9',
    backgroundColor: '#A9A9A9',
    color: 'white',
    fontSize: '11px',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  colorIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%'
  },
  expandButton: {
    padding: '6px 10px',
    border: '1px solid #ddd',
    backgroundColor: 'white',
    color: '#666',
    fontSize: '11px',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'all 0.2s'
  },
  closeButton: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666'
  },
};

export const globalStyles = `
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
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #FF1493;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  .venta-nueva {
    animation: slideIn 0.5s ease-out;
  }
`;