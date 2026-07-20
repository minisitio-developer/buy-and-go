export class Email {
    private constructor(readonly value: string) {}

    static create(email: string): Email {
        const normalized = email.toLowerCase().trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalized)) {
            throw new Error('Invalid email format');
        }
        return new Email(normalized);
    }
}

export class Password {
    private constructor(readonly value: string) {}

    static create(password: string): Password {
        if (password.length < 8) {
            throw new Error('Password must be at least 8 characters');
        }
        if (!/[A-Z]/.test(password)) {
            throw new Error('Password must contain an uppercase letter');
        }
        if (!/[0-9]/.test(password)) {
            throw new Error('Password must contain a number');
        }
        if (!/[!@#$%^&*]/.test(password)) {
            throw new Error('Password must contain a special character');
        }
        return new Password(password);
    }
}

export class Document {
    private constructor(readonly value: string) {}

    static create(document: string): Document {
        const cleaned = document.replace(/\D/g, '');
        if (cleaned.length !== 11 && cleaned.length !== 14) {
            throw new Error('Document must be CPF (11) or CNPJ (14) digits');
        }
        return new Document(cleaned);
    }

    get masked(): string {
        if (this.value.length === 11) {
            return this.value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        }
        return this.value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
}
