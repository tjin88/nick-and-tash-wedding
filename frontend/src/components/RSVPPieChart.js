import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import './RSVPPieChart.css';

const RADIAN = Math.PI / 180;

const RSVPPieChart = ({ invites }) => {
  const data = useMemo(() => {
    let canadaCount = 0;
    let australiaCount = 0;
    let bothCount = 0;
    let notAttendingCount = 0;
    let noResponseCount = 0;
    
    invites.forEach(invite => {
      const hasResponded = invite.guests.some(guest => guest.attendingStatus);
      
      if (!hasResponded) {
        noResponseCount += invite.guests.length;
        return;
      }
      
      invite.guests.forEach(guest => {
        switch(guest.attendingStatus) {
          case 'Canada Only':
            canadaCount++;
            break;
          case 'Australia Only':
            australiaCount++;
            break;
          case 'Both Australia and Canada':
            bothCount++;
            break;
          case 'Not Attending':
            notAttendingCount++;
            break;
          default:
            noResponseCount++;
        }
      });
    });

    return [
      { name: 'Canada Only', value: canadaCount, color: '#36B37E' },
      { name: 'Australia Only', value: australiaCount, color: '#FF5630' },
      { name: 'Both Locations', value: bothCount, color: '#6554C0' },
      { name: 'Not Attending', value: notAttendingCount, color: '#FFAB00' },
      { name: 'No Response', value: noResponseCount, color: '#8993A4' }
    ];
  }, [invites]);

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
    name
  }) => {
    const radius = outerRadius * 1.35;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const percentage = (percent * 100).toFixed(0);
    if (percentage < 1) return null;

    return (
      <text
        x={x}
        y={y}
        fill={data[index].color}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
      >
        {`${name} (${percentage}%)`}
      </text>
    );
  };

  return (
    <div className="rsvp-chart-container">
      <h2 className="rsvp-chart-title">RSVP Status Overview</h2>
      <div className="rsvp-chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={90}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RSVPPieChart;