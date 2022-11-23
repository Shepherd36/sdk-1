import { Component, createSignal, onCleanup, onMount, Show, useContext } from 'solid-js';
import { ArrowIcon, Text, TonIcon } from 'src/app/components';
import { ConnectorContext } from 'src/app/state/connector.context';
import { TonConnectUiContext } from 'src/app/state/ton-connect-ui.context';
import { AccountButtonStyled, DropdownContainerStyled, DropdownStyled } from './style';

interface AccountButtonProps {}

export const AccountButton: Component<AccountButtonProps> = () => {
    const connector = useContext(ConnectorContext)!;
    const tonConnectUI = useContext(TonConnectUiContext)!;
    const [isOpened, setIsOpened] = createSignal(false);
    const [address, setAddress] = createSignal('');

    let dropDownRef: HTMLDivElement | undefined;
    let buttonRef: HTMLButtonElement | undefined;

    const normalizedAddress = (): string => {
        if (address()) {
            return address().slice(0, 5) + '...' + address().slice(-3);
        }

        return '';
    };

    connector.onStatusChange(wallet => {
        if (!wallet) {
            setIsOpened(false);
            setAddress('');
            return;
        }

        setAddress(wallet.account.address);
    });

    const onClick = (e: Event): void | boolean => {
        if (!address() || !isOpened()) {
            return;
        }
        const clickToButton = buttonRef!.contains(e.target as Node);
        const clickToDropdown = dropDownRef!.contains(e.target as Node);

        if (!clickToButton && !clickToDropdown) {
            setIsOpened(false);
        }
    };

    onMount(() => {
        document.body.addEventListener('click', onClick);
    });

    onCleanup(() => document.body.removeEventListener('click', onClick));

    return (
        <>
            <Show when={!address()}>
                <AccountButtonStyled appearance="flat" onClick={() => tonConnectUI.connectWallet()}>
                    <TonIcon />
                    <Text fontSize="15px" letterSpacing="-0.24px" fontWeight="590">
                        Connect wallet
                    </Text>
                </AccountButtonStyled>
            </Show>
            <Show when={address()}>
                <DropdownContainerStyled>
                    <AccountButtonStyled
                        appearance="flat"
                        onClick={() => setIsOpened(v => !v)}
                        ref={buttonRef}
                    >
                        <span>{normalizedAddress()}</span>
                        <ArrowIcon direction={isOpened() ? 'top' : 'bottom'} />
                    </AccountButtonStyled>
                    <DropdownStyled
                        hidden={!isOpened()}
                        onClose={() => setIsOpened(false)}
                        ref={dropDownRef}
                    />
                </DropdownContainerStyled>
            </Show>
        </>
    );
};
