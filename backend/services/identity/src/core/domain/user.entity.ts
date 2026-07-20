import { Email, Password } from './value-objects';

export interface UserProps {
    id: string;
    email: Email;
    name: string;
    passwordHash: string;
    document?: string;
    phone?: string;
    locale: string;
    timezone: string;
    isActive: boolean;
    emailVerifiedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export class UserEntity {
    private constructor(private props: UserProps) {}

    static create(data: {
        id: string;
        email: string;
        name: string;
        password: string;
        document?: string;
        phone?: string;
    }): UserEntity {
        const email = Email.create(data.email);
        Password.create(data.password);

        return new UserEntity({
            id: data.id,
            email,
            name: data.name,
            passwordHash: '',
            document: data.document,
            phone: data.phone,
            locale: 'pt-BR',
            timezone: 'America/Sao_Paulo',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    static restore(props: UserProps): UserEntity {
        return new UserEntity(props);
    }

    get id(): string {
        return this.props.id;
    }

    get email(): string {
        return this.props.email.value;
    }

    get name(): string {
        return this.props.name;
    }

    get passwordHash(): string {
        return this.props.passwordHash;
    }

    get isActive(): boolean {
        return this.props.isActive;
    }

    get document(): string | undefined {
        return this.props.document;
    }

    get phone(): string | undefined {
        return this.props.phone;
    }

    verifyEmail(): void {
        this.props.emailVerifiedAt = new Date();
    }

    deactivate(): void {
        this.props.isActive = false;
    }

    activate(): void {
        this.props.isActive = true;
    }
}
