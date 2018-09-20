import cdk = require('@aws-cdk/cdk');
import { cloudformation, ListenerArn } from '../elasticloadbalancingv2.generated';
import { ITargetGroup } from './base-target-group';

/**
 * Base class for listeners
 */
export abstract class BaseListener extends cdk.Construct {
    public readonly listenerArn: ListenerArn;
    private readonly defaultActions: any[] = [];

    constructor(parent: cdk.Construct, id: string, additionalProps: any) {
        super(parent, id);

        const resource = new cloudformation.ListenerResource(this, 'Resource', {
            ...additionalProps,
            defaultActions: new cdk.Token(() => this.defaultActions),
        });

        this.listenerArn = resource.ref;
    }

    /**
     * Export this listener
     */
    public export(): ListenerRefProps {
        return {
            listenerArn: new ListenerArn(new cdk.Output(this, 'ListenerArn', { value: this.listenerArn }).makeImportValue())
        };
    }

    /**
     * Validate this listener
     */
    public validate(): string[] {
        if (this.defaultActions.length === 0) {
            return ['Listener needs at least one default target group (call addTargetGroups)'];
        }
        return [];
    }

    /**
     * Add a TargetGroup to the list of default actions of this listener
     */
    protected _addDefaultTargetGroup(targetGroup: ITargetGroup) {
        this.defaultActions.push({
            targetGroupArn: targetGroup.targetGroupArn,
            type: 'forward'
        });
    }
}

/**
 * Properties to reference an existing listener
 */
export interface ListenerRefProps {
    /**
     * ARN of the listener
     */
    listenerArn: ListenerArn;
}