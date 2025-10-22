import React, { useState } from 'react';
import { Eye, Ban, RefreshCw, FileText } from 'lucide-react';

// Componente Tooltip reutilizable
const Tooltip = ({ children, text, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-900',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-900'
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      
      {isVisible && (
        <div className={`absolute z-50 ${positionClasses[position]} animate-fade-in`}>
          <div className="bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
            {text}
            <div className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`} />
          </div>
        </div>
      )}
    </div>
  );
};

// Componente de demostración - CompraActions con Tooltips
const CompraActionsDemo = ({ compra }) => {
  const isActive = compra?.estado !== false;

  return (
    <div className="flex items-center justify-center gap-2">
      {/* Ver */}
      <Tooltip text="Ver detalles" position="top">
        <button
          className="action-btn view-btn"
          onClick={() => console.log('Ver compra')}
        >
          <Eye size={18} />
        </button>
      </Tooltip>

      {/* Anular o Reactivar */}
      {isActive ? (
        <Tooltip text="Anular compra" position="top">
          <button
            className="action-btn cancel-btn"
            onClick={() => console.log('Anular compra')}
          >
            <Ban size={18} />
          </button>
        </Tooltip>
      ) : (
        <Tooltip text="Reactivar compra" position="top">
          <button
            className="action-btn reactivate-btn"
            onClick={() => console.log('Reactivar compra')}
          >
            <RefreshCw size={18} />
          </button>
        </Tooltip>
      )}

      {/* Generar PDF */}
      <Tooltip text="Generar PDF" position="top">
        <button
          className="action-btn pdf-btn"
          onClick={() => console.log('Generar PDF')}
        >
          <FileText size={18} />
        </button>
      </Tooltip>
    </div>
  );
};

// Demo principal
export default function TooltipDemo() {
  const comprasEjemplo = [
    { id: 1, proveedor: 'Proveedor A', fecha: '2024-01-15', total: 150000, estado: true },
    { id: 2, proveedor: 'Proveedor B', fecha: '2024-01-16', total: 250000, estado: false },
    { id: 3, proveedor: 'Proveedor C', fecha: '2024-01-17', total: 180000, estado: true }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Tooltips Profesionales
          </h1>
          <p className="text-gray-600">
            Pasa el cursor sobre los iconos para ver los tooltips en acción
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">N°</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Proveedor</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Fecha</th>
                <th className="px-6 py-4 text-right text-sm font-semibold">Total</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Estado</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {comprasEjemplo.map((compra, index) => (
                <tr 
                  key={compra.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    !compra.estado ? 'bg-red-50' : ''
                  }`}
                >
                  <td className="px-6 py-4 text-gray-700">{index + 1}</td>
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    {compra.proveedor}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{compra.fecha}</td>
                  <td className="px-6 py-4 text-right text-gray-700 font-semibold">
                    ${compra.total.toLocaleString('es-CO')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        compra.estado
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {compra.estado ? '✓ Activa' : '✕ Anulada'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <CompraActionsDemo compra={compra} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sección de ejemplos de posiciones */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Diferentes Posiciones de Tooltip
          </h2>
          <div className="flex items-center justify-around gap-8">
            <Tooltip text="Tooltip arriba" position="top">
              <button className="demo-position-btn">Top</button>
            </Tooltip>
            
            <Tooltip text="Tooltip abajo" position="bottom">
              <button className="demo-position-btn">Bottom</button>
            </Tooltip>
            
            <Tooltip text="Tooltip izquierda" position="left">
              <button className="demo-position-btn">Left</button>
            </Tooltip>
            
            <Tooltip text="Tooltip derecha" position="right">
              <button className="demo-position-btn">Right</button>
            </Tooltip>
          </div>
        </div>
      </div>

      <style jsx>{`
        .action-btn {
          padding: 8px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .action-btn:active {
          transform: translateY(0);
        }

        .view-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .view-btn:hover {
          background: linear-gradient(135deg, #5568d3 0%, #6a4293 100%);
        }

        .cancel-btn {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
        }

        .cancel-btn:hover {
          background: linear-gradient(135deg, #e082ea 0%, #e4465b 100%);
        }

        .reactivate-btn {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
        }

        .reactivate-btn:hover {
          background: linear-gradient(135deg, #3e9bed 0%, #00e1ed 100%);
        }

        .pdf-btn {
          background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
          color: white;
        }

        .pdf-btn:hover {
          background: linear-gradient(135deg, #e95f89 0%, #edd02f 100%);
        }

        .demo-position-btn {
          padding: 12px 24px;
          border-radius: 10px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .demo-position-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translate(-50%, 0) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.15s ease-out;
        }
      `}</style>
    </div>
  );
}