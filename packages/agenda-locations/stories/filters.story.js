import React from 'react';
import Filters from '../components/src/Filters';
import Provider from '../components/src/Provider';

let query = {uids: {"0":"22735589","1":"24302628","2":"85513132","3":"94746758","4":"95409242","5":"19914400","6":"30114689","7":"12887384","8":"62251169","9":"99094862","10":"88037801","11":"77216536","12":"84067986","13":"57113890","14":"83194353","15":"34954669","16":"76363199","17":"40874855","18":"66956626","19":"13274565","20":"5064201","21":"39294690","22":"91130038","23":"72415805","24":"62784966","25":"154106","26":"72762832","27":"91615753","28":"936440","29":"16592859","30":"22618485","31":"47209246","32":"86842509","33":"46604689","34":"75248113","35":"23306182","36":"92333629","37":"74393650"}};

const queryChange = (newQuery) => {
  query = newQuery;
}

export default ({ locations, res, set }) => (
  <div className="top-margined col-sm-8 col-sm-offset-2 wsq content">
    <div className="js_locations_counter" data-res="http://localhost:3000/unverified"></div>
    <Provider lang="fr">
      <Filters
        locations={locations}
        query={query}
        onQueryChange={queryChange}
      />
    </Provider>
  </div>
);