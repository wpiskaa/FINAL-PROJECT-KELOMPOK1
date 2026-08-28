const { getDB } = require('../config/database');

function getDashboardStats(req, res) {
  const db = getDB();
  const today = new Date().toISOString().slice(0, 10);

  // Today's stats
  const todayStats = db.prepare(`
    SELECT 
      COUNT(*) as total_transactions,
      COALESCE(SUM(total_amount), 0) as total_revenue
    FROM transactions 
    WHERE DATE(created_at) = ? AND status = 'completed'
  `).get(today);

  // This month stats
  const thisMonth = today.slice(0, 7);
  const monthStats = db.prepare(`
    SELECT 
      COUNT(*) as total_transactions,
      COALESCE(SUM(total_amount), 0) as total_revenue
    FROM transactions 
    WHERE strftime('%Y-%m', created_at) = ? AND status = 'completed'
  `).get(thisMonth);

  // Total products
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products WHERE is_available = 1').get();

  // Top selling products (all time)
  const topProducts = db.prepare(`
    SELECT p.name, p.price, c.name as category, 
           SUM(ti.quantity) as total_sold,
           SUM(ti.subtotal) as total_revenue
    FROM transaction_items ti
    JOIN products p ON ti.product_id = p.id
    LEFT JOIN categories c ON p.category_id = c.id
    GROUP BY p.id
    ORDER BY total_sold DESC
    LIMIT 5
  `).all();

  // Recent transactions
  const recentTransactions = db.prepare(`
    SELECT t.transaction_code, t.total_amount, t.created_at, u.name as cashier_name
    FROM transactions t
    JOIN users u ON t.cashier_id = u.id
    ORDER BY t.created_at DESC
    LIMIT 10
  `).all();

  // Revenue chart (last 7 days)
  const revenueChart = db.prepare(`
    SELECT DATE(created_at) as date, 
           COALESCE(SUM(total_amount), 0) as revenue,
           COUNT(*) as transactions
    FROM transactions
    WHERE created_at >= DATE('now', '-6 days') AND status = 'completed'
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `).all();

  res.json({
    success: true,
    data: {
      today: {
        transactions: todayStats.total_transactions,
        revenue: todayStats.total_revenue
      },
      this_month: {
        transactions: monthStats.total_transactions,
        revenue: monthStats.total_revenue
      },
      total_products: productCount.count,
      top_products: topProducts,
      recent_transactions: recentTransactions,
      revenue_chart: revenueChart
    }
  });
}

module.exports = { getDashboardStats };
