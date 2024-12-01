import React from 'react';
import './Menu.css';

function Menu({ invitedLocation }) {
  
  const renderLocationMenu = (location) => (
    <div className={`${location}-menu-section`}>
      <h2>{invitedLocation === 'Both Australia and Canada' ? `${location} ` : ''}Reception</h2>
      {location === 'Canada' ? null : (
        <div className="menu-course">
          <h3>Appetizers</h3>
          <ul>
            <li>Australian Appetizer 1</li>
            <li>Australian Appetizer 2</li>
          </ul>
        </div>
      )}
      <div className="menu-course">
        {location === 'Canada' ? (
          <>
            <h3>Chinese Banquet</h3>
            <ul>
              <li>鴻運乳豬件海蜇海澟</li>
              <li>Roasted suckling pig with jelly fish and seaweed</li>
              <li>杏花炸釀蟹拑</li>
              <li>Deep fried crab claws stuffed in shrimp mousse coated with almond crust</li>
              <li>翡翠蝦球帶子</li>
              <li>Sautéed prawns and scallops with vegetables</li>
              <li>鮑参海味羹</li>
              <li>Supreme Soup with Shredded Abalone, Sea Cucumber, Fish Maw, Conpoy, and Shiitake</li>
              <li>翡翠北菰玉環瑤柱甫</li>
              <li>Braised stuffed melon marrow with whole conpoy and shiitake mushrooms on a bed of greens</li>
              <li>美極雙龍蝦</li>
              <li>Wok fried twin lobsters in Maggie sauce</li>
              <li>享譽脆皮雞</li>
              <li>Roasted crispy chicken</li>
              <li>清蒸湖中霸</li>
              <li>Steamed twin seasonal fish with ginger and scallion in soya seasoning</li>
              <li>百子四寶炒飯</li>
              <li>Fried rice with conpoy, egg white, seafood and tobiko</li>
              <li>金菰炆伊麵</li>
              <li>Braised e-fu noodle with enoki mushroom</li>
            </ul>
          </>
        ) : (
          <>
            <h3>Main Course</h3>
            <ul>
              <li>Australian Main 1</li>
              <li>Australian Main 2</li>
            </ul>
          </>
        )}
      </div>
      <div className="menu-course">
        <h3>Dessert</h3>
        {location === 'Canada' ? (
          <ul>
            <li>百年好合</li>
            <li>Red bean soup with lily bulb and lotus seeds</li>
            <li>永結同心</li>
            <li>Fancy wedding pastries</li>
          </ul>
        ) : (
          <ul>
            <li>Australian Dessert</li>
          </ul>
        )}
      </div>
    </div>
  );

  return (
    <div className="menu-container">
      <h1 className='title'>Menu</h1>
      {invitedLocation === 'Both Australia and Canada' ? (
        <>
          {renderLocationMenu('Canada')}
          <div className="menu-divider"></div>
          {renderLocationMenu('Australia')}
        </>
      ) : (
        renderLocationMenu(invitedLocation)
      )}
    </div>
  );
}

export default Menu;