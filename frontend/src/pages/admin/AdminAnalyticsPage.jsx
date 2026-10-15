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
  Line,
  Legend
} from 'recharts';

export const AdminAnalyticsPage = () => {
  const [trends, setTrends] = useState([]);
  const [departmentPerf, setDepartmentPerf] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const [trendsRes, deptRes] = await Promise.allSettled([
          analyticsService.getResolutionTrends('60d'),
          analyticsService.getDepartmentPerformance(),
        ]);

        if (trendsRes.status === 'fulfilled') {
          const t = trendsRes.value;
          setTrends(Array.isArray(t) ? t : t?.data || []);
        }

        if (deptRes.status === 'fulfilled') {
          const d = deptRes.value;
          setDepartmentPerf(Array.isArray(d) ? d : d?.data || []);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        role="admin"
        title="City-Wide Platform Analytics"
        subtitle="Comprehensive metrics on municipal response times, department workload allocation, and citizen issue resolution performance."
      />

      {error && (
        <ErrorState
          title="Could Not Load Analytics"
          message="Failed to retrieve analytics data from the server."
          error={error}
          role="admin"
        />
      )}

      {loading && !error && <SkeletonLoader count={2} type="card" />}

      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="City-Wide Incident Inflow & Resolution"
            subtitle="Reported problems vs verified fixes over 60 days"
            empty={trends.length === 0}
            emptyMessage="No time-series incident trends have been recorded by the server yet."
          >
            {trends.length > 0 && (
              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="reported"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="New Reports"
                    />
                    <Line
                      type="monotone"
                      dataKey="resolved"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="Resolved & Closed"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>

          <ChartCard
            title="Department Workload & Performance"
            subtitle="Active caseload by department division"
            empty={departmentPerf.length === 0}
            emptyMessage="No department workload performance metrics recorded by the backend."
          >
            {departmentPerf.length > 0 && (
              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={departmentPerf}
                    layout="vertical"
                    margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0ECF5" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#6B687A' }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#6B687A' }} width={120} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #E9E5F0',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                      }}
                    />
                    <Bar dataKey="active" fill="#4338CA" name="Active Cases" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="resolved" fill="#10B981" name="Resolved" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>
        </div>
      )}
    </div>
  );
};
