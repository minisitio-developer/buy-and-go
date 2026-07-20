import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

@Injectable()
export class OrganizationsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: { name: string; slug: string; document?: string; plan?: string }) {
        const existing = await this.prisma.organization.findUnique({
            where: { slug: data.slug },
        });

        if (existing) {
            throw new ConflictException('Organization slug already exists');
        }

        return this.prisma.organization.create({
            data: {
                name: data.name,
                slug: data.slug,
                document: data.document,
                plan: data.plan || 'starter',
            },
        });
    }

    async findById(id: string) {
        return this.prisma.organization.findUnique({
            where: { id },
            include: { members: true },
        });
    }

    async addMember(organizationId: string, userId: string, role: string) {
        return this.prisma.organizationMember.create({
            data: { organizationId, userId, role },
        });
    }

    async listMembers(organizationId: string) {
        return this.prisma.organizationMember.findMany({
            where: { organizationId },
            include: {
                user: {
                    select: { id: true, name: true, email: true, avatarUrl: true },
                },
            },
        });
    }
}
