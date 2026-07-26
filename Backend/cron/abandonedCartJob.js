import cron from 'node-cron';
import User from '../models/usersModel.js';
import sendEmail from '../utils/sendEmail.js';

const THRESHOLD_HOURS = 24;

const setupAbandonedCartJob = () => {
    cron.schedule('0 * * * *', async () => {
        const threshold = new Date(Date.now() - THRESHOLD_HOURS * 60 * 60 * 1000);

        try {
            const abandonedUsers = await User.find({
                'cart.0': { $exists: true },
                cartUpdatedAt: { $lt: threshold },
            }).populate('cart.product', 'name price image');

            for (const user of abandonedUsers) {
                if (!user.email || user.cart.length === 0) continue;

                const itemsHtml = user.cart
                    .filter(item => item.product)
                    .map(item => `
                        <li style="margin-bottom:12px">
                            <img src="${item.product.image?.[0]?.url || ''}" width="80" style="vertical-align:middle;margin-right:8px"/>
                            <strong>${item.product.name}</strong> x${item.quantity}
                        </li>`)
                    .join('');

                if (!itemsHtml) continue;

                const message = `
                    <p>Hi ${user.name},</p>
                    <p>You left some items in your cart:</p>
                    <ul>${itemsHtml}</ul>
                    <p><a href="${process.env.FRONTEND_URL}/cart">Complete your purchase →</a></p>
                `;

                try {
                    await sendEmail({ email: user.email, subject: "You left something behind 🛒", message });
                    // Reset cartUpdatedAt to avoid re-sending until cart changes again
                    await User.findByIdAndUpdate(user._id, { cartUpdatedAt: new Date() });
                } catch (err) {
                    console.error(`[ABANDONED_CART] Failed to email ${user.email}:`, err.message);
                }
            }
        } catch (err) {
            console.error('[ABANDONED_CART] Job error:', err.message);
        }
    });
};

export default setupAbandonedCartJob;
