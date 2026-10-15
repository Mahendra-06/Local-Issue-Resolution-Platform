import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { ChartCard } from '../../components/common/ChartCard';
import { ErrorState } from '../../components/common/ErrorState';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { analyticsService } from '../../api/analyticsService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

export const ManagerAnalyticsPage = () => {
  const [trends, setTrends] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const [trendsRes, catRes] = await Promise.allSettled([
          analyticsService.getResolutionTrends('30d'),
          analyticsService.getCategoryDistribution(),
        ]);

        if (trendsRes.status === 'fulfilled') {
          const tData = trendsRes.value;
          setTrends(Array.isArray(tData) ? tData : tData?.data || []);
        }

        if (catRes.status === 'fulfilled') {
          const cData = catRes.value;
          setCategories(Array.isArray(cData) ? cData : cData?.data || []);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const COLORS = ['#0F766E', '#14B8A6', '#65A30D', '#84CC16', '#3B82F6', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6">
      <PageHeader
        role="manager"
        title="Department Operational Analytics"
        subtitle="Live metrics on resolution velocity, SLA adherence, and volume distribution across problem categories."
      />

      {error && (
        <ErrorState
          title="Could Not Load Analytics"
          message="Failed to retrieve analytics data from the server."
          error={error}
          role="manager"
        />
      )}

      {loading && !error && <SkeletonLoader count={2} type="card" />}

      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resolution Velocity & Volume Chart */}
          <ChartCard
            title="Resolution Trends (Last 30 Days)"
            subtitle="Daily incidents reported vs verified resolutions"
            empty={trends.length === 0}
            emptyMessage="No historical resolution trend points recorded by the backend yet."
          >
            {trends.length > 0 && (
              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0ECF5" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B687A' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#6B687A' }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #E9E5F0',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                      }}
                    />
                    <Bar dataKey="reported" fill="#93C5FD" name="Reported" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="resolved" fill="#0F766E" name="Resolved" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>

          {/* Category Distribution Chart */}
          <ChartCard
            title="Incident Volume by Category"
            subtitle="Departmental workload breakdown"
            empty={categories.length === 0}
            emptyMessage="No category distribution records reported by the server."
          >
            {categories.length > 0 && (
              <div className="h-72 w-full pt-4 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={45}
                      paddingAngle={4}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #E9E5F0',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>
        </div>
      )}
    </div>
  );
};
