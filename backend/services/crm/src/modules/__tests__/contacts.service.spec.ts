import { Test, TestingModule } from '@nestjs/testing';
import { ContactsService } from '../contacts/contacts.service';
import { ContactRepository } from '../../domain/repositories/contact.repository';
import { Contact } from '../../domain/entities/contact.entity';
import { NotFoundException } from '@nestjs/common';

describe('ContactsService', () => {
  let service: ContactsService;
  let repo: jest.Mocked<ContactRepository>;

  const now = new Date('2024-01-01');

  beforeEach(async () => {
    repo = {
      findById: jest.fn(),
      save: jest.fn(),
      findByOrganization: jest.fn(),
      findByEmail: jest.fn(),
      findByDocument: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactsService,
        { provide: 'ContactRepository', useValue: repo },
      ],
    }).compile();

    service = module.get<ContactsService>(ContactsService);
  });

  it('should create contact', async () => {
    const result = await service.create({
      organizationId: 'org1',
      name: 'John Doe',
      email: 'john@example.com',
      tags: ['vip'],
    });

    expect(result.id).toBeDefined();
    expect(result.name).toBe('John Doe');
    expect(result.email).toBe('john@example.com');
    expect(result.tags).toEqual(['vip']);
    expect(repo.save).toHaveBeenCalledWith(result);
  });

  it('should list contacts with pagination', async () => {
    const contact = new Contact('c1', 'org1', null, 'John', 'john@test.com', null, null, null, null, null, [], now, now);
    repo.findByOrganization.mockResolvedValue([[contact], 1]);

    const result = await service.findAll('org1', { page: 1, perPage: 20 });

    expect(result.data).toHaveLength(1);
    expect(result.pagination.total).toBe(1);
  });

  it('should search contacts', async () => {
    repo.findByOrganization.mockResolvedValue([[], 0]);
    await service.findAll('org1', { search: 'John' });

    expect(repo.findByOrganization).toHaveBeenCalledWith('org1', 'John', 1, 20);
  });

  it('should find contact by id', async () => {
    const contact = new Contact('c1', 'org1', null, 'John', 'john@test.com', null, null, null, null, null, [], now, now);
    repo.findById.mockResolvedValue(contact);

    const result = await service.findById('c1');
    expect(result.id).toBe('c1');
  });

  it('should handle contact not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
  });

  it('should update contact', async () => {
    const contact = new Contact('c1', 'org1', null, 'John', 'john@test.com', null, null, null, null, null, [], now, now);
    repo.findById.mockResolvedValue(contact);

    const result = await service.update('c1', { name: 'Jane Doe', email: 'jane@test.com' });

    expect(result.name).toBe('Jane Doe');
    expect(result.email).toBe('jane@test.com');
    expect(repo.save).toHaveBeenCalled();
  });

  it('should merge contacts', async () => {
    const primary = new Contact('c1', 'org1', null, 'John', 'john@test.com', null, null, null, null, null, [], now, now);
    const secondary = new Contact('c2', 'org1', null, '', 'other@test.com', '555-1234', null, 'Acme', 'CEO', null, [], now, now);

    repo.findById.mockResolvedValueOnce(primary).mockResolvedValueOnce(secondary);

    const result = await service.merge('c1', 'c2');

    expect(result.name).toBe('John');
    expect(result.phone).toBe('555-1234');
    expect(result.company).toBe('Acme');
    expect(repo.save).toHaveBeenCalled();
    expect(repo.delete).toHaveBeenCalledWith('c2');
  });

  it('should throw on merge different organizations', async () => {
    const primary = new Contact('c1', 'org1', null, 'John', null, null, null, null, null, null, [], now, now);
    const secondary = new Contact('c2', 'org2', null, 'Jane', null, null, null, null, null, null, [], now, now);

    repo.findById.mockResolvedValueOnce(primary).mockResolvedValueOnce(secondary);

    await expect(service.merge('c1', 'c2')).rejects.toThrow(
      'Cannot merge contacts from different organizations',
    );
  });

  it('should add tag', async () => {
    const contact = new Contact('c1', 'org1', null, 'John', null, null, null, null, null, null, [], now, now);
    repo.findById.mockResolvedValue(contact);

    const result = await service.addTag('c1', 'vip');
    expect(result.tags).toContain('vip');
  });

  it('should remove tag', async () => {
    const contact = new Contact('c1', 'org1', null, 'John', null, null, null, null, null, null, ['vip'], now, now);
    repo.findById.mockResolvedValue(contact);

    const result = await service.removeTag('c1', 'vip');
    expect(result.tags).not.toContain('vip');
  });

  it('should update consent', async () => {
    const contact = new Contact('c1', 'org1', null, 'John', null, null, null, null, null, null, [], now, now);
    repo.findById.mockResolvedValue(contact);

    const result = await service.updateConsent('c1', 'email_marketing', true);
    expect(result.consentHistory).toHaveLength(1);
    expect(result.consentHistory[0].granted).toBe(true);
  });

  it('should add interaction', async () => {
    const contact = new Contact('c1', 'org1', null, 'John', null, null, null, null, null, null, [], now, now);
    repo.findById.mockResolvedValue(contact);

    const result = await service.addInteraction('c1', 'call', 'Discussed proposal');
    expect(result.interactions).toHaveLength(1);
    expect(result.interactions[0].description).toBe('Discussed proposal');
  });

  it('should remove contact', async () => {
    const contact = new Contact('c1', 'org1', null, 'John', null, null, null, null, null, null, [], now, now);
    repo.findById.mockResolvedValue(contact);
    repo.delete.mockResolvedValue();

    await service.remove('c1');
    expect(repo.delete).toHaveBeenCalledWith('c1');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
