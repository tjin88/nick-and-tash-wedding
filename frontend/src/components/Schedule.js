import React from 'react';
import './Schedule.css';

const Schedule = (props) => {
  return (
    <div class="schedule">
      <div class="row">
        <div class="schedule-column col-lg-10">
          <h1 class="schedule-title">Schedule</h1>
          <div class="schedule-item">
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
          <div class="schedule-item">
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
          <div class="schedule-item">
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
          <div class="schedule-item">
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
        </div>
      </div>
    </div>
  );
}

export default Schedule;
