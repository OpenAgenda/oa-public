# @openagenda/usageCounter

import UsageCounters from '@opeangenda/usageCounters';

function init(config) {
return userCounters({
bucketLifeSpan: 1000\*60,
redisCli,

});
}

// à l'usage

const {
usageCounters,
} = req.app.services;

(req, res, next) => {
usageCounters('users', req.user.uid).increment({
volume: res.headers.size,
items: events.length,
calls: 1,
});
}

sur redis:
usageCounters:users:389839 -> { begin, end, store: {volume, items, calls} }

createdAt neeed to be a at a specific time for graph later usage (subdiv de lifespan)

usage_counter

sur mysql:
namespace, ['users', 'agendas', ...]
identifier, ['userUid', '']
store: {volume, item, store}
begin, // <-createdAt
end, // <-createdAt + lifespan

[{
volume: 78978456489789,
items: 789789,
calls: 1456456,
}]
