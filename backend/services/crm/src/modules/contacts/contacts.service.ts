import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { ContactRepository } from '../../domain/repositories/contact.repository';
import { Contact } from '../../domain/entities/contact.entity';
import { randomUUID } from 'crypto';
import { EventBusService, TOPICS } from '@eventos-ai/messaging';

@Injectable()
export class ContactsService {
  constructor(
    @Inject('ContactRepository')
    private readonly contactRepo: ContactRepository,
    private readonly eventBus: EventBusService,
  ) {}

  async create(data: {
    organizationId: string;
    name: string;
    email?: string;
    phone?: string;
    document?: string;
    company?: string;
    position?: string;
    source?: string;
    tags?: string[];
  }) {
    const now = new Date();
    const contact = new Contact(
      randomUUID(),
      data.organizationId,
      null,
      data.name,
      data.email ?? null,
      data.phone ?? null,
      data.document ?? null,
      data.company ?? null,
      data.position ?? null,
      data.source ?? null,
      data.tags ?? [],
      now,
      now,
    );

    await this.contactRepo.save(contact);

    this.eventBus.publish(
      TOPICS.CRM.CONTACT_CREATED,
      TOPICS.CRM.CONTACT_CREATED,
      {
        contactId: contact.id,
        organizationId: data.organizationId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        document: data.document,
        company: data.company,
        position: data.position,
        source: data.source,
        tags: data.tags ?? [],
        createdAt: now,
      },
    ).catch(err => console.error('Failed to publish contact.created event', err));

    return contact;
  }

  async findAll(
    organizationId: string,
    params: { search?: string; page?: number; perPage?: number },
  ) {
    const { search, page = 1, perPage = 20 } = params;
    const [contacts, total] = await this.contactRepo.findByOrganization(
      organizationId,
      search,
      page,
      perPage,
    );
    return {
      data: contacts,
      pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
    };
  }

  async findById(id: string) {
    const contact = await this.contactRepo.findById(id);
    if (!contact) throw new NotFoundException('Contact not found');
    return contact;
  }

  async update(
    id: string,
    data: { name?: string; email?: string; phone?: string; company?: string; position?: string; tags?: string[] },
  ) {
    const contact = await this.findById(id);
    if (data.name !== undefined) contact.name = data.name;
    if (data.email !== undefined) contact.email = data.email;
    if (data.phone !== undefined) contact.phone = data.phone;
    if (data.company !== undefined) contact.company = data.company;
    if (data.position !== undefined) contact.position = data.position;
    if (data.tags !== undefined) {
      contact['_tags'] = [...data.tags];
    }
    contact.updatedAt = new Date();
    await this.contactRepo.save(contact);
    return contact;
  }

  async merge(id: string, otherId: string) {
    const [primary, secondary] = await Promise.all([
      this.findById(id),
      this.findById(otherId),
    ]);
    if (primary.organizationId !== secondary.organizationId) {
      throw new ConflictException('Cannot merge contacts from different organizations');
    }
    primary.mergeWith(secondary);
    await this.contactRepo.save(primary);
    await this.contactRepo.delete(secondary.id);
    return primary;
  }

  async addTag(id: string, tag: string) {
    const contact = await this.findById(id);
    contact.addTag(tag);
    await this.contactRepo.save(contact);
    return contact;
  }

  async removeTag(id: string, tag: string) {
    const contact = await this.findById(id);
    contact.removeTag(tag);
    await this.contactRepo.save(contact);
    return contact;
  }

  async updateConsent(id: string, type: string, granted: boolean) {
    const contact = await this.findById(id);
    contact.updateConsent(type, granted);
    await this.contactRepo.save(contact);
    return contact;
  }

  async addInteraction(id: string, type: string, description: string) {
    const contact = await this.findById(id);
    contact.addInteraction(type, description);
    await this.contactRepo.save(contact);
    return contact;
  }

  async remove(id: string) {
    await this.findById(id);
    await this.contactRepo.delete(id);
  }
}
