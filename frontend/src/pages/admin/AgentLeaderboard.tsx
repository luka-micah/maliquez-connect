import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/authApi';
import { FiAward, FiUsers, FiCheckCircle, FiTrendingUp } from 'react-icons/fi';
import { useState } from 'react';

const AgentLeaderboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: async () => {
      const res = await adminApi.getReports();
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  const rankings = data?.agentRankings || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Agent Leaderboard</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Rank</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Agent</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Total Registered</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Approved</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Approval Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rankings.map((agent: any, index: number) => {
                const approvalRate = agent.totalRegistered > 0
                  ? Math.round((agent.approvedCount / agent.totalRegistered) * 100)
                  : 0;
                return (
                  <tr key={agent.agentId} className={`hover:bg-gray-50 ${index < 3 ? 'bg-yellow-50/50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {index === 0 && <FiAward className="w-5 h-5 text-yellow-500" />}
                        {index === 1 && <FiAward className="w-5 h-5 text-gray-400" />}
                        {index === 2 && <FiAward className="w-5 h-5 text-orange-400" />}
                        {index > 2 && <span className="text-gray-400 font-medium">#{index + 1}</span>}
                        {index < 3 && <span className="font-medium text-gray-900">#{index + 1}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{agent.name}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <FiUsers className="w-4 h-4 text-gray-400" />
                        <span>{agent.totalRegistered}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <FiCheckCircle className="w-4 h-4 text-green-500" />
                        <span>{agent.approvedCount}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <FiTrendingUp className={`w-4 h-4 ${approvalRate >= 50 ? 'text-green-500' : 'text-yellow-500'}`} />
                        <span>{approvalRate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rankings.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">No agents yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AgentLeaderboard;
