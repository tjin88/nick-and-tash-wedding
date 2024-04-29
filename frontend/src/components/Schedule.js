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
            <h3>October 10, 1 - 5 pm</h3>
            <p><em>The first place - Check in ?</em></p>
            <ul>              
              <li>Lil description</li>
              <li>It's a pre cool one</li>
            </ul>
          </div>
          <div class="schedule-item">
            <h2>Drinks</h2>
            <h3>October 10, 5 - 5:30 pm</h3>
            <p><em>Appy's at the bar</em></p>
            <ul>
              <li>Lil description</li>
              <li>It's a pre cool one</li>
            </ul>
          </div>
          <div class="schedule-item">
            <h2>Main Event</h2>
            <h3>October 10, 6 - close</h3>
            <p><em>Some big big place</em></p>
            <ul>
              <li>Big description</li>
              <li>It's really cool</li>
              <li>Whoot</li>
            </ul>
          </div>
          <div class="schedule-item">
            <h2>After Party</h2>
            <h3>October 11, 12 - 12</h3>
            <p><em>Some big big place</em></p>
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
