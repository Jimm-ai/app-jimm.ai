import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { ResourceType } from 'librechat-data-provider';
import { Switch, InfoHoverCard, ESide, Label } from '@librechat/client';
import { useLocalize, useAuthContext } from '~/hooks';
import { SystemRoles } from 'librechat-data-provider';
import { useGetAgentByIdQuery } from '~/data-provider';
import { cn } from '~/utils';

interface DefaultStarredToggleProps {
  agentId?: string | null;
  agentDbId?: string | null;
  resourceType?: ResourceType;
  className?: string;
  isDefaultStarred?: boolean;
  onDefaultStarredChange?: (isDefaultStarred: boolean) => void;
}

export default function DefaultStarredToggle({
  agentId,
  agentDbId: _agentDbId,
  resourceType = ResourceType.AGENT,
  className,
  isDefaultStarred: propIsDefaultStarred,
  onDefaultStarredChange,
}: DefaultStarredToggleProps) {
  const localize = useLocalize();
  const { user } = useAuthContext();

  // Fetch agent data to get current is_default_starred value if not provided as prop
  const { data: agent } = useGetAgentByIdQuery(agentId, {
    enabled:
      !!agentId &&
      user?.role === SystemRoles.ADMIN &&
      resourceType === ResourceType.AGENT &&
      propIsDefaultStarred === undefined,
  });

  const isDefaultStarred = propIsDefaultStarred ?? agent?.is_default_starred ?? false;
  const [isDefaultStarredState, setIsDefaultStarredState] = useState(isDefaultStarred);

  // Sync state when prop or agent data changes
  useEffect(() => {
    setIsDefaultStarredState(isDefaultStarred);
  }, [isDefaultStarred]);

  const handleToggle = React.useCallback(
    (checked: boolean) => {
      setIsDefaultStarredState(checked);
      onDefaultStarredChange?.(checked);
    },
    [onDefaultStarredChange],
  );

  // Only show for admins and agents
  if (user?.role !== SystemRoles.ADMIN || resourceType !== ResourceType.AGENT || !agentId) {
    return null;
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex border-t border-border-light" />
      <div className="group relative rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'transition-colors duration-200',
                isDefaultStarredState
                  ? 'text-yellow-600 dark:text-yellow-500'
                  : 'text-text-secondary',
              )}
            >
              <Star className="size-5" />
            </div>
            <div className="flex items-center gap-2">
              <Label
                htmlFor="default-starred-toggle"
                className="cursor-pointer text-sm font-medium text-text-primary"
              >
                {localize('com_ui_default_starred')}
              </Label>
              <InfoHoverCard
                side={ESide.Top}
                text={localize('com_ui_default_starred_description')}
              />
            </div>
          </div>
          <Switch
            id="default-starred-toggle"
            checked={isDefaultStarredState}
            onCheckedChange={handleToggle}
            aria-label={localize('com_ui_default_starred')}
          />
        </div>
      </div>
    </div>
  );
}
