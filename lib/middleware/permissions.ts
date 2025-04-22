import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export interface ResourcePermission {
  resourceType: 'chat' | 'document' | 'suggestion';
  resourceId: string;
  requiredAction: 'read' | 'write' | 'delete';
}

const ResourcePermissionSchema = z.object({
  resourceType: z.enum(['chat', 'document', 'suggestion']),
  resourceId: z.string(),
  requiredAction: z.enum(['read', 'write', 'delete'])
});

export async function validatePermissions(permission: ResourcePermission) {
  try {
    // Validar el formato de los datos de entrada
    const validatedPermission = ResourcePermissionSchema.parse(permission);
    
    // Obtener la sesión del usuario
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar la propiedad del recurso según su tipo
    let hasPermission = false;
    const userId = session.user.email;

    switch (validatedPermission.resourceType) {
      case 'chat': {
        const chat = await prisma.chat.findFirst({
          where: {
            id: validatedPermission.resourceId,
            userId
          }
        });
        hasPermission = !!chat;
        break;
      }

      case 'document': {
        const document = await prisma.document.findFirst({
          where: {
            id: validatedPermission.resourceId,
            userId
          }
        });
        hasPermission = !!document;
        break;
      }

      case 'suggestion': {
        const suggestion = await prisma.suggestion.findFirst({
          where: {
            id: validatedPermission.resourceId,
            userId
          }
        });
        hasPermission = !!suggestion;
        break;
      }

      default:
        logger.error('Invalid resource type', { 
          resourceType: validatedPermission.resourceType 
        });
        return NextResponse.json(
          { error: 'Invalid resource type' }, 
          { status: 400 }
        );
    }

    if (!hasPermission) {
      logger.warn('Permission denied', {
        userId,
        resourceType: validatedPermission.resourceType,
        resourceId: validatedPermission.resourceId,
        requiredAction: validatedPermission.requiredAction
      });
      
      return NextResponse.json(
        { error: 'Permission denied' }, 
        { status: 403 }
      );
    }

    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Invalid permission data', { error: error.errors });
      return NextResponse.json(
        { error: 'Invalid permission data' }, 
        { status: 400 }
      );
    }

    logger.error('Permission validation error', { error });
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 