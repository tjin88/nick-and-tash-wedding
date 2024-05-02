import React from 'react';
import './Schedule.css';

function Schedule () {
  return (
    <div className="schedule">
      <div className="row">
        <div className="schedule-column col-lg-10">
          <h1 className="schedule-title">Schedule</h1>
          <div className="schedule-item">
            <h2>Event 1</h2>
            <div className='scheduleHorizontal'>
              <h3>October 10, 5 - 5:30 pm</h3>
              <h3>|</h3>
              <h3><em>Some Given Location</em></h3>
            </div>
            <ul>              
              <li>Lil description</li>
              <li>It's a pre cool one</li>
            </ul>
          </div>
          <div className="schedule-item">
            <h2>Drinks</h2>
            <div className='scheduleHorizontal'>
              <h3>October 10, 5 - 5:30 pm</h3>
              <h3>|</h3>
              <h3><em>Some Given Location</em></h3>
            </div>
            <ul>
              <li>Lil description</li>
              <li>It's a pre cool one</li>
            </ul>
          </div>
          <div className="schedule-item">
            <h2>Main Event</h2>
            <div className='scheduleHorizontal'>
              <h3>October 10, 5 - 5:30 pm</h3>
              <h3>|</h3>
              <h3><em>Some Given Location</em></h3>
            </div>
            <ul>
              <li>Big description</li>
              <li>It's really cool</li>
              <li>Whoot</li>
            </ul>
          </div>
          <div className="schedule-item">
            <h2>After Party</h2>
            <div className='scheduleHorizontal'>
              <h3>October 10, 5 - 5:30 pm</h3>
              <h3>|</h3>
              <h3><em>Some Given Location</em></h3>
            </div>
            <ul>
              <li>Whoot</li>
            </ul>
          </div>
          <div className="schedule-item">
            <h2>Something Else</h2>
            <div className='scheduleHorizontal'>
              <h3>October 10, 5 - 5:30 pm</h3>
              <h3>|</h3>
              <h3><em>Some Given Location</em></h3>
            </div>
            <ul>
              <li>Whoot</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Schedule;
