import { Component, JSXElement, Show, useContext } from 'solid-js';
import { Translation } from 'src/app/components/typography/Translation';
import { ActionModalStyled, ButtonStyled, H1Styled, TextStyled } from './style';
import { WithDataAttributes } from 'src/app/models/with-data-attributes';
import { useDataAttributes } from 'src/app/hooks/use-data-attributes';
import { TonConnectUiContext } from 'src/app/state/ton-connect-ui.context';
import { addReturnStrategy, isInTWA, openLink, openLinkBlank } from 'src/app/utils/web-api';
import { eqWalletName } from 'src/app/utils/wallets';
import { AT_WALLET_APP_NAME } from 'src/app/env/AT_WALLET_APP_NAME';
import { isTelegramUrl, WalletInfo } from '@tonconnect/sdk';

interface ActionModalProps extends WithDataAttributes {
    headerTranslationKey: string;
    headerTranslationValues?: Record<string, string>;
    icon: JSXElement;
    textTranslationKey?: string;
    textTranslationValues?: Record<string, string>;
    onClose: () => void;
    showButton?: 'close' | 'open-wallet';
}

export const ActionModal: Component<ActionModalProps> = props => {
    const dataAttrs = useDataAttributes(props);
    const tonConnectUI = useContext(TonConnectUiContext);

    let universalLink: string | undefined;
    if (
        tonConnectUI?.wallet &&
        'universalLink' in tonConnectUI.wallet &&
        (tonConnectUI.wallet.openMethod === 'universal-link' ||
            (isTelegramUrl(tonConnectUI.wallet.universalLink) && isInTWA()))
    ) {
        universalLink = tonConnectUI.wallet.universalLink;
    }

    const onOpenWallet = (): void => {
        if (eqWalletName(tonConnectUI!.wallet as WalletInfo, AT_WALLET_APP_NAME)) {
            openLinkBlank(addReturnStrategy(universalLink!, 'back'));
        }
        openLink(addReturnStrategy(universalLink!, 'back'));
    };

    return (
        <ActionModalStyled {...dataAttrs}>
            {props.icon}
            <H1Styled
                translationKey={props.headerTranslationKey}
                translationValues={props.headerTranslationValues}
            />
            <TextStyled
                translationKey={props.textTranslationKey}
                translationValues={props.textTranslationValues}
            />
            <Show when={props.showButton !== 'open-wallet'}>
                <ButtonStyled onClick={() => props.onClose()}>
                    <Translation translationKey="common.close">Close</Translation>
                </ButtonStyled>
            </Show>
            <Show when={props.showButton === 'open-wallet' && universalLink}>
                <ButtonStyled onClick={onOpenWallet}>
                    <Translation translationKey="common.openWallet">Open wallet</Translation>
                </ButtonStyled>
            </Show>
        </ActionModalStyled>
    );
};
