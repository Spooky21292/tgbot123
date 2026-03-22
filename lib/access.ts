import { db } from '@/lib/db';

export function hasActiveAccess(user: { activePlan?: string | null; planExpiresAt?: Date | string | null; familyOwnerId?: string | null } | null | undefined) {
  if (!user) return false;
  const expiresAt = user.planExpiresAt ? new Date(user.planExpiresAt) : null;
  const directAccess = ['learning', 'family'].includes(user.activePlan ?? '') && Boolean(expiresAt && expiresAt.getTime() > Date.now());
  return directAccess || Boolean(user.familyOwnerId);
}

export function isFamilyPlan(user: { activePlan?: string | null; planExpiresAt?: Date | string | null } | null | undefined) {
  if (!user) return false;
  const expiresAt = user.planExpiresAt ? new Date(user.planExpiresAt) : null;
  return user.activePlan === 'family' && Boolean(expiresAt && expiresAt.getTime() > Date.now());
}

export async function getViewerAccess(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      activePlan: true,
      planExpiresAt: true,
      familyOwnerId: true,
      familyMembers: { select: { id: true, email: true, name: true } }
    }
  });

  if (!user) return null;

  const familyOwner = user.familyOwnerId
    ? await db.user.findUnique({
        where: { id: user.familyOwnerId },
        select: {
          id: true,
          activePlan: true,
          planExpiresAt: true,
          name: true,
          email: true,
          familyMembers: { select: { id: true, email: true, name: true } }
        }
      })
    : null;

  const accessUser = familyOwner ?? user;
  const accessActive = hasActiveAccess(accessUser);
  const familyGroup = familyOwner
    ? [
        { id: familyOwner.id, email: familyOwner.email, name: familyOwner.name },
        ...familyOwner.familyMembers
      ]
    : [{ id: user.id, email: '', name: '' }, ...user.familyMembers];

  return {
    ...user,
    accessActive,
    accessPlan: accessUser.activePlan,
    accessExpiresAt: accessUser.planExpiresAt,
    familyOwner,
    familyGroup
  };
}
