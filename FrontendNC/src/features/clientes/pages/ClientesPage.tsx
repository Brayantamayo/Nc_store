import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, MapPin, Package2, Users, Plus } from 'lucide-react';
import { clienteService } from '../services/clienteService';
import { ClientesTable } from '../components/ClientesTable';
import { ClienteDetailModal } from '../components/ClienteDetailModal';
import { ClienteEditModal } from '../components/ClienteEditModal';
import type { ClienteListado, ClienteDetalle } from '../types';
import styles from '../../panel/css/Admin.module.css';

export const ClientesPage = () => {
  const [clientes, setClientes] = useState<ClienteListado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modales
  const [selectedClienteId, setSelectedClienteId] = useState<number | null>(null);
  const [editingCliente, setEditingCliente] = useState<ClienteListado | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchClientes = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await clienteService.listar();
      setClientes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar clientes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchClientes();
  }, []);

  const handleToggleActivo = async (cliente: ClienteListado) => {
    try {
      await clienteService.toggleActivo(cliente.id);
      void fetchClientes();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al cambiar estado del cliente');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredClientes = clientes.filter((c) => {
    const nombreCompleto = `${c.usuario.nombre || ''} ${c.usuario.apellido || ''} ${c.usuario.nombreVisible || ''}`.toLowerCase();
    const email = (c.usuario.email || '').toLowerCase();
    const ciudad = (c.ciudad || '').toLowerCase();
    const query = searchTerm.toLowerCase();
    return nombreCompleto.includes(query) || email.includes(query) || ciudad.includes(query);
  });

  const totalClients = clientes.length;
  const activeClients = clientes.filter((c) => c.activo).length;
  const inactiveClients = totalClients - activeClients;

  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={styles.ordersShell}>
      <div className={styles.ordersCard}>
        <div className={styles.tableHeaderArea}>
          <div>
            <h2 className={styles.ordersSectionTitle}>Clientes ({totalClients})</h2>
            <p className={styles.ordersSectionSubtitle}>
              Administración de clientes registrados en el sistema, compras realizadas y estado de su cuenta.
            </p>
          </div>

          <div className={styles.ordersLegend}>
            <span className={styles.ordersStatusDelivered}>
              <Users size={13} />
              {activeClients} activos
            </span>
            <span className={styles.ordersStatusCancelled}>
              <Users size={13} />
              {inactiveClients} inactivos
            </span>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className={styles.saveBtn}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '6px 12px' }}
            >
              <Plus size={16} /> Nuevo Cliente
            </button>
          </div>
        </div>

        {/* Buscador */}
        <div style={{ padding: '0 24px 16px 24px' }}>
          <input
            type="text"
            placeholder="Buscar por nombre, correo o ciudad..."
            value={searchTerm}
            onChange={handleSearch}
            className={styles.textInput}
            style={{ width: '100%', maxWidth: '400px' }}
          />
        </div>

        {isLoading ? (
          <div className={styles.ordersEmptyState}>
            <strong>Cargando clientes</strong>
            <span>Trayendo la lista de clientes desde la base de datos...</span>
          </div>
        ) : error ? (
          <div className={styles.ordersEmptyState}>
            <strong>Ocurrió un error</strong>
            <span>{error}</span>
          </div>
        ) : (
          <ClientesTable
            clientes={filteredClientes}
            onView={(c) => setSelectedClienteId(c.id)}
            onEdit={(c) => setEditingCliente(c)}
            onToggleActivo={handleToggleActivo}
          />
        )}
      </div>

      <AnimatePresence>
        {/* Modal de Detalle */}
        {selectedClienteId !== null && (
          <ClienteDetailModal
            clienteId={selectedClienteId}
            onClose={() => setSelectedClienteId(null)}
            onEdit={(c) => {
              setSelectedClienteId(null);
              setEditingCliente(c);
            }}
          />
        )}

        {/* Modal de Creación */}
        {isCreateModalOpen && (
          <ClienteEditModal
            mode="create"
            onClose={() => setIsCreateModalOpen(false)}
            onSaved={fetchClientes}
          />
        )}

        {/* Modal de Edición */}
        {editingCliente !== null && (
          <ClienteEditModal
            mode="edit"
            cliente={editingCliente}
            onClose={() => setEditingCliente(null)}
            onSaved={fetchClientes}
          />
        )}
      </AnimatePresence>
    </motion.section>
  );
};

