import { useState, memo, useRef } from 'react';
import * as Select from '@ariakit/react/select';
import {
  FileText,
  LogOut,
  DollarSign,
  Sparkles,
  AlertCircle,
  Settings as SettingsIcon,
} from 'lucide-react';
import { SettingsTabValues } from 'librechat-data-provider';
import { LinkIcon, GearIcon, DropdownMenuSeparator, Avatar } from '@librechat/client';
import { MyFilesModal } from '~/components/Chat/Input/Files/MyFilesModal';
import { useGetStartupConfig, useGetUserBalance } from '~/data-provider';
import { useAuthContext } from '~/hooks/AuthContext';
import { useLocalize } from '~/hooks';
import Settings from './Settings';

function AccountSettings() {
  const localize = useLocalize();
  const { user, isAuthenticated, logout } = useAuthContext();
  const { data: startupConfig } = useGetStartupConfig();
  const balanceQuery = useGetUserBalance({
    enabled: !!isAuthenticated && startupConfig?.balance?.enabled,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<SettingsTabValues | undefined>(
    undefined,
  );

  // Open Settings with Balance tab active
  const handleBalanceClick = () => {
    setSettingsInitialTab(SettingsTabValues.BALANCE);
    setShowSettings(true);
  };

  // Open Settings normally (without specific tab)
  const handleSettingsClick = () => {
    setSettingsInitialTab(undefined);
    setShowSettings(true);
  };
  const [showFiles, setShowFiles] = useState(false);
  const accountSettingsButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <Select.SelectProvider>
      <Select.Select
        ref={accountSettingsButtonRef}
        aria-label={localize('com_nav_account_settings')}
        data-testid="nav-user"
        className="mt-text-sm flex h-auto w-full items-center gap-2 rounded-xl p-2 text-sm transition-all duration-200 ease-in-out hover:bg-surface-hover aria-[expanded=true]:bg-surface-hover"
      >
        <div className="-ml-0.9 -mt-0.8 h-8 w-8 flex-shrink-0">
          <div className="relative flex">
            <Avatar user={user} size={32} />
          </div>
        </div>
        <div
          className="mt-2 grow overflow-hidden text-ellipsis whitespace-nowrap text-left text-text-primary"
          style={{ marginTop: '0', marginLeft: '0' }}
        >
          {user?.name ?? user?.username ?? localize('com_nav_user')}
        </div>
      </Select.Select>
      <Select.SelectPopover
        className="popover-ui w-[305px] rounded-lg md:w-[235px]"
        style={{
          transformOrigin: 'bottom',
          translate: '0 -4px',
        }}
      >
        <div className="text-token-text-secondary ml-3 mr-2 py-2 text-sm" role="note">
          {user?.email ?? localize('com_nav_user')}
        </div>
        <DropdownMenuSeparator />
        {startupConfig?.balance?.enabled === true && balanceQuery.data != null && (
          <>
            <div className="ml-3 mr-2 py-2" role="note">
              <div className="flex items-center justify-between">
                <div className="text-token-text-secondary text-sm">
                  {localize('com_nav_balance')}:{' '}
                  {new Intl.NumberFormat().format(Math.round(balanceQuery.data.tokenCredits))}
                </div>
                <div className="flex items-center gap-1.5">
                  {balanceQuery.data.hasActiveSubscription ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                      <Sparkles className="h-3 w-3" />
                      {balanceQuery.data.subscriptionPlan === 'plus'
                        ? localize('com_nav_plan_plus')
                        : localize('com_nav_plan_standard')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      {localize('com_nav_trial')}
                    </span>
                  )}
                </div>
              </div>
              {/* Trial Depleted Warning */}
              {balanceQuery.data.isTrialDepleted && (
                <div className="mt-1 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-3 w-3" />
                  {localize('com_nav_trial_depleted')}
                </div>
              )}
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        <Select.SelectItem
          value=""
          onClick={() => setShowFiles(true)}
          className="select-item text-sm"
        >
          <FileText className="icon-md" aria-hidden="true" />
          {localize('com_nav_my_files')}
        </Select.SelectItem>
        {startupConfig?.helpAndFaqURL !== '/' && (
          <Select.SelectItem
            value=""
            onClick={() => window.open(startupConfig?.helpAndFaqURL, '_blank')}
            className="select-item text-sm"
          >
            <LinkIcon aria-hidden="true" />
            {localize('com_nav_help_faq')}
          </Select.SelectItem>
        )}
        {startupConfig?.balance?.enabled && (
          <Select.SelectItem value="" onClick={handleBalanceClick} className="select-item text-sm">
            <DollarSign className="icon-md" aria-hidden="true" />
            {localize('com_nav_balance')}
          </Select.SelectItem>
        )}
        <Select.SelectItem value="" onClick={handleSettingsClick} className="select-item text-sm">
          <SettingsIcon className="icon-md" aria-hidden="true" />
          {localize('com_nav_settings')}
        </Select.SelectItem>
        <DropdownMenuSeparator />
        <Select.SelectItem
          aria-selected={true}
          onClick={() => logout()}
          value="logout"
          className="select-item text-sm"
        >
          <LogOut className="icon-md" aria-hidden="true" />
          {localize('com_nav_log_out')}
        </Select.SelectItem>
      </Select.SelectPopover>
      {showFiles && (
        <MyFilesModal
          open={showFiles}
          onOpenChange={setShowFiles}
          triggerRef={accountSettingsButtonRef}
        />
      )}
      {showSettings && (
        <Settings
          open={showSettings}
          onOpenChange={setShowSettings}
          initialTab={settingsInitialTab}
        />
      )}
    </Select.SelectProvider>
  );
}

export default memo(AccountSettings);
