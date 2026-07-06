export type ClienteUsuario = {
  id: number;
  email: string;
  nombre: string | null;
  apellido: string | null;
  nombreVisible: string | null;
};

export type ClientePedidoResumen = {
  id: number;
  estado: string;
  total: string | number;
  creadoEn: string;
  _count: {
    items: number;
  };
};

export type ClienteListado = {
  id: number;
  usuarioId: number;
  direccion: string | null;
  direccion2: string | null;
  region: string | null;
  ciudad: string | null;
  codigoPostal: string | null;
  creadoEn: string;
  usuario: ClienteUsuario;
  _count: {
    pedidos: number;
  };
  totalGastado?: string | number | null;
  ultimoPedidoEn?: string | null;
};

export type ClienteDetalle = ClienteListado & {
  pedidos: ClientePedidoResumen[];
};

export type ClienteFormValues = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  displayName: string;
  addressLine1: string;
  addressLine2: string;
  region: string;
  city: string;
  postalCode: string;
};

export type ClienteFormPayload = Omit<ClienteFormValues, 'password'> & {
  password?: string;
};
