import React, { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, queryCache } from 'react-query';
import { useIntl } from 'react-intl';
import { css } from '@emotion/core';
import { useApiClient } from '@openagenda/react-shared';
import { Link } from 'react-router-dom';
import Loading from '../components/Loading';

export default function Elasticsearch() {
  const apiClient = useApiClient();
  const intl = useIntl();

  const [replicas, setReplicas] = useState('');
  const { isLoading, error, data } = useQuery(
    'esCluster',
    async () => (await apiClient('/supervisor/elasticsearch/cluster')).data,
    {
      refetchInterval: 1000,
      onSuccess: data2 => {
        if (isLoading) {
          // first load
          setReplicas(data2.replicas);
        }
      }
    }
  );

  const [mutateReplicas, mutationStatus] = useMutation(
    value => apiClient.post('/supervisor/elasticsearch/cluster/replicas', {
      value: parseInt(value, 10)
    }),
    {
      // Optimistically update the cache value on mutate, but store
      // the old value and return it so that it's accessible in case of
      // an error
      onMutate: value => {
        queryCache.cancelQueries('esCluster');

        const previousValue = queryCache.getQueryData('esCluster');

        queryCache.setQueryData('esCluster', old => ({
          ...old,
          replicas: value
        }));

        return previousValue;
      },
      // On failure, roll back to the previous value
      onError: (err, variables, previousValue) => {
        queryCache.setQueryData('esCluster', previousValue);
      },
      // After success or failure, refetch the todos query
      onSettled: () => {
        queryCache.invalidateQueries('esCluster');
      }
    }
  );

  const onReplicasSubmit = useCallback(
    event => {
      event.preventDefault();
      mutateReplicas(replicas);
    },
    [mutateReplicas, replicas]
  );

  const onReplicasChange = useCallback(event => {
    setReplicas(event.target.value);
  }, []);

  // Remove queries on unmout for reload on remount
  useEffect(() => () => queryCache.removeQueries('esCluster'), []);

  if (isLoading) {
    return (
      <div className="margin-top-md container">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="margin-top-md container">
        An error has occurred: {error.message}
      </div>
    );
  }

  return (
    <div className="margin-top-md container">
      <div className="margin-bottom-md">
        <h1>Elasticsearch</h1>
        <Link to="/supervisor">Retour</Link>
      </div>

      <h2>Stats</h2>

      <div>
        Statut:{' '}
        {data.stats.status === 'green' ? (
          <i
            className="fa fa-check text-success"
            aria-hidden="true"
            css={css`
              font-size: 18px;
            `}
          />
        ) : null}
        {data.stats.status === 'yellow' ? (
          <i
            className="fa fa-exclamation-triangle"
            aria-hidden="true"
            css={css`
              font-size: 18px;
              color: #ffc107;
            `}
          />
        ) : null}
        {data.stats.status === 'red' ? (
          <i
            className="fa fa-exclamation-triangle text-danger"
            aria-hidden="true"
            css={css`
              font-size: 18px;
            `}
          />
        ) : null}
      </div>

      <div>Nombre d&apos;index: {intl.formatNumber(data.stats.indexCount)}</div>

      <div>
        Nombre de documents: {intl.formatNumber(data.stats.documentCount)}
      </div>

      <div>
        CPU utilisé:{' '}
        {intl.formatNumber(data.stats.usedCPUPercent / 100, {
          style: 'percent'
        })}
      </div>

      <div>
        Mémoire utilisée:{' '}
        {intl.formatNumber(data.stats.usedMemoryPercent / 100, {
          style: 'percent'
        })}
      </div>

      <h2>Nœuds</h2>

      {data.nodes.map(node => (
        <div className="margin-top-sm" key={node.key}>
          <div>Clé: {node.key}</div>
          <div>Nom: {node.name}</div>
          <div>Adresse de transport: {node.transport_address}</div>
          <div>Hôte: {node.host}</div>
          <div>Ip: {node.ip}</div>
          <div>Version: {node.version}</div>
        </div>
      ))}

      <h2>Réplicas</h2>

      <div>Nombre de replicas: {data.replicas}</div>

      <form className="margin-top-sm form-inline" onSubmit={onReplicasSubmit}>
        Modifier:{' '}
        <input
          className="form-control"
          type="number"
          value={replicas}
          onChange={onReplicasChange}
        />{' '}
        <button type="submit" className="btn btn-primary btn-bordered">
          Valider
        </button>
        {mutationStatus.error ? (
          <span className="margin-left-md text-danger">
            {mutationStatus.error?.message || mutationStatus.error}
          </span>
        ) : null}
      </form>
    </div>
  );
}
