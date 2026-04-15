import React, { useCallback, useState } from 'react';
import { useIntl } from 'react-intl';
import { Button, VStack } from '@openagenda/uikit';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogCloseTrigger,
  DialogBody,
  DialogFooter,
} from '@openagenda/uikit/snippets';
import useSWRInfinite from 'swr/infinite';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import qs from 'qs';
import ky from 'ky';
import { useInView } from 'react-intersection-observer';
import ModalLoadingBody from '@/src/components/ModalLoadingBody';
import SearchInput from '@/src/components/SearchInput';
import { useAgenda } from '../../_context/agenda';
import useEvent from '../../_hooks/useEvent';
import { transferOwnershipModal as messages } from '../../messages';
import useMember from '../../_hooks/useMember';
import MemberItem from './MemberItem';

const PAGE_SIZE = 20;

function transferOwnership(
  url,
  { arg }: { arg: { userUid?: number; email?: string } },
): Promise<any> {
  return ky
    .post(url, {
      json: arg,
    })
    .json();
}

function TransferOwnershipModalBody({ onSuccess }) {
  const agenda = useAgenda();
  const { event } = useEvent();
  const { mutate: mutateMember } = useMember();

  const [searchValue, setSearchValue] = useState('');

  const onSubmit = useCallback((e: React.SyntheticEvent) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      search: { value: string };
    };

    setSearchValue(target.search.value);
  }, []);

  const {
    data: pages,
    error,
    size,
    setSize,
    // isValidating,
  } = useSWRInfinite(
    (pageIndex, previousPageData) => {
      // reached the end
      if (previousPageData && !previousPageData.items) return null;

      // first page, we don't have `previousPageData`
      if (pageIndex === 0)
        return ['transferOwnershipModal', 'members', searchValue];

      // add the cursor to the API endpoint
      return [
        'transferOwnershipModal',
        'members',
        searchValue,
        previousPageData.after,
      ];
    },
    ([_comp, _requestId, search, after]) => {
      const searchParamsStr = qs.stringify(
        {
          detailed: 1,
          search: search !== '' ? search : undefined,
          after,
        },
        { addQueryPrefix: true },
      );

      return fetch(`/api/agendas/${agenda.uid}/members${searchParamsStr}`).then(
        (r) => {
          if (r.ok) return r.json();
          throw new Error("Can't list agendas");
        },
      );
    },
    {
      keepPreviousData: true,
      revalidateFirstPage: false,
      // revalidateOnMount: false,
      // revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      // use: [swrLaggyMiddleware],
    },
  );

  const isLoadingInitialData = !pages && !error;
  const isLoadingMore =
    isLoadingInitialData ||
    (size > 0 && pages && pages[size - 1] === undefined);
  const isEmpty = pages?.[0]?.items?.length === 0;
  const isReachingEnd =
    isEmpty || (pages && pages[pages.length - 1]?.items?.length < PAGE_SIZE);

  // search member + user by email if isEmpty
  const memberByEmail = useSWR(
    isEmpty && searchValue.length
      ? `/api/agendas/${agenda.uid}/members/email/${encodeURIComponent(searchValue)}?detailed=1`
      : null,
  );

  const { trigger: onTransfer } = useSWRMutation(
    `/${agenda.slug}/admin/members/transfer/${event.slug}?json=1`,
    transferOwnership,
    {
      onSuccess() {
        mutateMember().catch(() => null);
        onSuccess();
      },
    },
  );

  const { ref } = useInView({
    onChange: (inView) => {
      if (inView && !isReachingEnd && !isLoadingMore) {
        setSize(size + 1).catch(() => null);
      }
    },
  });

  if (isLoadingInitialData) {
    return <ModalLoadingBody />;
  }

  return (
    <DialogBody>
      <form onSubmit={onSubmit}>
        <SearchInput onChange={setSearchValue} />
      </form>

      <VStack gap="4" pt="4" align="start">
        {pages.map((page) =>
          page.items.map((member) => (
            <MemberItem
              key={member.userUid || member.email}
              member={member}
              onTransfer={onTransfer}
            />
          )),
        )}

        {memberByEmail.data ? (
          <MemberItem
            member={memberByEmail.data}
            email={searchValue}
            onTransfer={onTransfer}
          />
        ) : null}
      </VStack>

      <div ref={ref} />
    </DialogBody>
  );
}

function ConfirmationModalBody({ onClose }) {
  const intl = useIntl();

  return (
    <>
      <DialogBody>
        {intl.formatMessage(messages.ownershipTransfered)}
      </DialogBody>
      <DialogFooter>
        <Button onClick={onClose}>{intl.formatMessage(messages.close)}</Button>
      </DialogFooter>
    </>
  );
}

export default function TransferOwnershipModal({ isOpen, onClose }) {
  const intl = useIntl();

  const [step, setStep] = useState(0);

  return (
    <DialogRoot open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader fontSize="xl" fontWeight="semibold">
          {intl.formatMessage(messages.transferOwnership)}
        </DialogHeader>
        <DialogCloseTrigger />

        {step === 0 ? (
          <TransferOwnershipModalBody onSuccess={() => setStep(1)} />
        ) : null}
        {step === 1 ? <ConfirmationModalBody onClose={onClose} /> : null}
      </DialogContent>
    </DialogRoot>
  );
}
