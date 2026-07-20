import { Contact } from '../entities/contact.entity';

export interface ContactRepository {
  findById(id: string): Promise<Contact | null>;
  save(contact: Contact): Promise<void>;
  findByOrganization(
    orgId: string,
    search?: string,
    page?: number,
    limit?: number,
  ): Promise<[Contact[], number]>;
  findByEmail(orgId: string, email: string): Promise<Contact | null>;
  findByDocument(orgId: string, document: string): Promise<Contact | null>;
  delete(id: string): Promise<void>;
}
