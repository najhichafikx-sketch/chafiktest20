import { verifyUser } from '@/lib/auth';
import { findUserById, getDailyGenerationCount } from '@/lib/users';

export async function GET(request) {
  const decoded = verifyUser(request);
  if (!decoded) {
    return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (decoded.role === 'admin') {
      return Response.json({
        success: true,
        user: { email: 'admin', credits: 'Unlimited', plan: 'premium', daily_generations: 0 }
      });
    }

    const user = await findUserById(decoded.id);
    if (!user) {
      return Response.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const dailyGen = await getDailyGenerationCount(decoded.id);

    return Response.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        credits: user.credits,
        plan: user.plan,
        daily_generations: dailyGen,
        created_at: user.created_at
      }
    });
  } catch (err) {
    return Response.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
