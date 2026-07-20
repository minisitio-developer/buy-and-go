import { Contact } from '../entities/contact.entity';

describe('Contact Entity', () => {
  const now = new Date('2024-01-01');

  const createContact = (overrides: Partial<Contact> = {}): Contact =>
    new Contact(
      overrides.id ?? 'c1',
      overrides.organizationId ?? 'org1',
      overrides.userId ?? null,
      overrides.name ?? 'John Doe',
      overrides.email ?? 'john@example.com',
      overrides.phone ?? null,
      overrides.document ?? '123.456.789-00',
      overrides.company ?? null,
      overrides.position ?? null,
      overrides.source ?? null,
      overrides.tags ?? [],
      overrides.createdAt ?? now,
      overrides.updatedAt ?? now,
    );

  it('should create contact', () => {
    const contact = createContact();
    expect(contact.id).toBe('c1');
    expect(contact.name).toBe('John Doe');
    expect(contact.email).toBe('john@example.com');
    expect(contact.tags).toEqual([]);
  });

  it('should merge duplicates taking primary fields', () => {
    const primary = createContact({ name: 'John Doe', email: 'john@example.com' });
    const secondary = createContact({
      id: 'c2',
      name: '',
      email: 'john.doe@other.com',
      phone: '555-1234',
      company: 'Acme Inc',
    });

    primary.mergeWith(secondary);
    expect(primary.name).toBe('John Doe');
    expect(primary.email).toBe('john@example.com');
    expect(primary.phone).toBe('555-1234');
    expect(primary.company).toBe('Acme Inc');
  });

  it('should merge tags without duplicates', () => {
    const primary = createContact({ tags: ['vip', 'lead'] });
    const secondary = createContact({ id: 'c2', tags: ['lead', 'enterprise'] });

    primary.mergeWith(secondary);
    expect(primary.tags).toEqual(expect.arrayContaining(['vip', 'lead', 'enterprise']));
    expect(primary.tags.length).toBe(3);
  });

  it('should reject merge across organizations', () => {
    const primary = createContact();
    const secondary = createContact({ id: 'c2', organizationId: 'org2' });
    expect(() => primary.mergeWith(secondary)).toThrow(
      'Cannot merge contacts from different organizations',
    );
  });

  it('should track LGPD consent changes', () => {
    const contact = createContact();
    contact.updateConsent('email_marketing', true);
    contact.updateConsent('sms', false);

    expect(contact.consentHistory).toHaveLength(2);
    expect(contact.consentHistory[0].type).toBe('email_marketing');
    expect(contact.consentHistory[0].granted).toBe(true);
    expect(contact.consentHistory[1].type).toBe('sms');
    expect(contact.consentHistory[1].granted).toBe(false);
  });

  it('should add interaction history', () => {
    const contact = createContact();
    contact.addInteraction('call', 'Discussed contract terms');
    contact.addInteraction('email', 'Sent proposal');

    expect(contact.interactions).toHaveLength(2);
    expect(contact.interactions[0].type).toBe('call');
    expect(contact.interactions[0].description).toBe('Discussed contract terms');
    expect(contact.interactions[1].type).toBe('email');
  });

  it('should add tag', () => {
    const contact = createContact();
    contact.addTag('vip');
    expect(contact.tags).toContain('vip');
  });

  it('should not add duplicate tag', () => {
    const contact = createContact({ tags: ['vip'] });
    contact.addTag('VIP');
    expect(contact.tags).toHaveLength(1);
  });

  it('should reject empty tag', () => {
    const contact = createContact();
    expect(() => contact.addTag('')).toThrow('Tag cannot be empty');
  });

  it('should remove tag', () => {
    const contact = createContact({ tags: ['vip', 'lead'] });
    contact.removeTag('vip');
    expect(contact.tags).toEqual(['lead']);
  });

  it('should throw when removing non-existent tag', () => {
    const contact = createContact();
    expect(() => contact.removeTag('nonexistent')).toThrow('Tag "nonexistent" not found');
  });
});
