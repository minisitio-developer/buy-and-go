import { Email, Password, Document } from './value-objects';

describe('Email', () => {
    it('should create valid email', () => {
        const email = Email.create('John@Example.com');
        expect(email.value).toBe('john@example.com');
    });

    it('should reject invalid email', () => {
        expect(() => Email.create('invalid')).toThrow('Invalid email format');
    });

    it('should reject empty email', () => {
        expect(() => Email.create('')).toThrow('Invalid email format');
    });
});

describe('Password', () => {
    it('should accept valid password', () => {
        const pwd = Password.create('Str0ng!Pass');
        expect(pwd.value).toBe('Str0ng!Pass');
    });

    it('should reject short password', () => {
        expect(() => Password.create('Ab1!')).toThrow('at least 8 characters');
    });

    it('should reject password without uppercase', () => {
        expect(() => Password.create('str0ng!pass')).toThrow('uppercase');
    });

    it('should reject password without number', () => {
        expect(() => Password.create('Strong!Pass')).toThrow('number');
    });

    it('should reject password without special char', () => {
        expect(() => Password.create('Str0ngPass')).toThrow('special character');
    });
});

describe('Document', () => {
    it('should format CPF', () => {
        const doc = Document.create('12345678901');
        expect(doc.masked).toBe('123.456.789-01');
    });

    it('should format CNPJ', () => {
        const doc = Document.create('12345678000190');
        expect(doc.masked).toBe('12.345.678/0001-90');
    });

    it('should reject invalid length', () => {
        expect(() => Document.create('123')).toThrow('CPF (11) or CNPJ (14)');
    });

    it('should strip formatting', () => {
        const doc = Document.create('123.456.789-01');
        expect(doc.value).toBe('12345678901');
    });
});
