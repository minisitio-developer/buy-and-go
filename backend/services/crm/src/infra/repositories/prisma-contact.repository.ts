import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ContactRepository } from '../../domain/repositories/contact.repository';
import { Contact } from '../../domain/entities/contact.entity';

@Injectable()
export class PrismaContactRepository implements ContactRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Contact | null> {
    const record = await this.prisma.contact.findUnique({ where: { id } });
    if (!record) return null;
    return this.toDomain(record);
  }

  async save(contact: Contact): Promise<void> {
    await this.prisma.contact.upsert({
      where: { id: contact.id },
      create: {
        id: contact.id,
        organizationId: contact.organizationId,
        userId: contact.userId,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        document: contact.document,
        company: contact.company,
        position: contact.position,
        source: contact.source,
        tags: contact.tags,
        createdAt: contact.createdAt,
      },
      update: {
        userId: contact.userId,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        document: contact.document,
        company: contact.company,
        position: contact.position,
        source: contact.source,
        tags: contact.tags,
      },
    });
  }

  async findByOrganization(
    orgId: string,
    search?: string,
    page = 1,
    limit = 20,
  ): Promise<[Contact[], number]> {
    const where: any = { organizationId: orgId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [records, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.contact.count({ where }),
    ]);
    return [records.map((r) => this.toDomain(r)), total];
  }

  async findByEmail(orgId: string, email: string): Promise<Contact | null> {
    const record = await this.prisma.contact.findFirst({
      where: { organizationId: orgId, email },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findByDocument(orgId: string, document: string): Promise<Contact | null> {
    const record = await this.prisma.contact.findFirst({
      where: { organizationId: orgId, document },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.contact.delete({ where: { id } });
  }

  private toDomain(record: any): Contact {
    const tags = typeof record.tags === 'string' ? JSON.parse(record.tags) : record.tags ?? [];
    return new Contact(
      record.id,
      record.organizationId,
      record.userId,
      record.name,
      record.email,
      record.phone,
      record.document,
      record.company,
      record.position,
      record.source,
      tags,
      record.createdAt,
      record.updatedAt,
    );
  }
}
