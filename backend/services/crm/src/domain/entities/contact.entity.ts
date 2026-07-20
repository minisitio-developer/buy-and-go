export interface ConsentRecord {
  type: string;
  granted: boolean;
  changedAt: Date;
}

export interface Interaction {
  type: string;
  description: string;
  timestamp: Date;
}

export class Contact {
  private _consentHistory: ConsentRecord[] = [];
  private _interactions: Interaction[] = [];
  private _tags: string[];

  constructor(
    public readonly id: string,
    public organizationId: string,
    public userId: string | null,
    public name: string,
    public email: string | null,
    public phone: string | null,
    public document: string | null,
    public company: string | null,
    public position: string | null,
    public source: string | null,
    tags: string[],
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {
    this._tags = [...tags];
  }

  get tags(): string[] {
    return [...this._tags];
  }

  get consentHistory(): ConsentRecord[] {
    return [...this._consentHistory];
  }

  get interactions(): Interaction[] {
    return [...this._interactions];
  }

  mergeWith(otherContact: Contact): void {
    if (this.organizationId !== otherContact.organizationId) {
      throw new Error('Cannot merge contacts from different organizations');
    }

    this.name = this.name || otherContact.name;
    this.email = this.email || otherContact.email;
    this.phone = this.phone || otherContact.phone;
    this.document = this.document || otherContact.document;
    this.company = this.company || otherContact.company;
    this.position = this.position || otherContact.position;
    this.source = this.source || otherContact.source;

    const existingTags = new Set(this._tags.map((t) => t.toLowerCase()));
    for (const tag of otherContact._tags) {
      if (!existingTags.has(tag.toLowerCase())) {
        this._tags.push(tag);
      }
    }

    this._interactions.push(...otherContact._interactions);
    this._consentHistory.push(...otherContact._consentHistory);
    this.updatedAt = new Date();
  }

  addTag(tag: string): void {
    if (!tag || tag.trim().length === 0) {
      throw new Error('Tag cannot be empty');
    }
    if (this._tags.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      return;
    }
    this._tags.push(tag.trim());
    this.updatedAt = new Date();
  }

  removeTag(tag: string): void {
    const index = this._tags.findIndex((t) => t.toLowerCase() === tag.toLowerCase());
    if (index === -1) {
      throw new Error(`Tag "${tag}" not found`);
    }
    this._tags.splice(index, 1);
    this.updatedAt = new Date();
  }

  updateConsent(type: string, granted: boolean): void {
    this._consentHistory.push({
      type,
      granted,
      changedAt: new Date(),
    });
    this.updatedAt = new Date();
  }

  addInteraction(type: string, description: string): void {
    this._interactions.push({
      type,
      description,
      timestamp: new Date(),
    });
    this.updatedAt = new Date();
  }
}
