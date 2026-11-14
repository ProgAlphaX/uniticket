import { EstadoUsuario, RolUsuario } from '../config/catalogos';

export interface Usuario {
  nId_Usuario: number;
  sNombres: string;
  sApellidos: string;
  sNombreCompleto: string;
  sEmail: string;
  sDni: string;
  sTelefono: string | null;
  sRol: RolUsuario;
  sEstado: EstadoUsuario;
}

export interface LoginRequest {
  sEmail: string;
  sPassword: string;
}

export interface UsuarioCreate {
  sNombres: string;
  sApellidos: string;
  sEmail: string;
  sDni: string;
  sTelefono: string;
  sRol: RolUsuario;
  sPassword: string;
}

export interface UsuarioUpdate {
  sNombres: string;
  sApellidos: string;
  sEmail: string;
  sTelefono: string;
}
