import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/login');
  const form = await request.formData();
  const webinarId = String(form.get('webinarId'));
  await db.webinarEnrollment.upsert({
    where: { userId_webinarId: { userId: session.user.id, webinarId } },
    update: {},
    create: { userId: session.user.id, webinarId }
  });
  redirect(`/webinars/${webinarId}`);
}
