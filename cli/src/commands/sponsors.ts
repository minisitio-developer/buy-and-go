import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import ora from 'ora';
import { EventOSClient } from '@eventos-ai/sdk';

export function sponsorsCommand(getClient: () => EventOSClient): Command {
  const cmd = new Command('sponsors').description('Manage sponsors');

  cmd
    .command('list')
    .description('List sponsors for an event')
    .argument('<eventId>', 'Event ID')
    .action(async (eventId: string) => {
      const spinner = ora('Loading sponsors...').start();
      try {
        const client = getClient();
        const sponsors = await client.sponsors.list(eventId);
        spinner.stop();

        if (sponsors.length === 0) {
          console.log(chalk.yellow('No sponsors found'));
          return;
        }

        const table = new Table({
          head: ['Name', 'Tier', 'Status', 'Booths', 'Contract'],
          style: { head: ['cyan'] },
        });

        for (const sponsor of sponsors) {
          table.push([
            sponsor.name.slice(0, 25),
            tierBadge(sponsor.tier),
            sponsor.status,
            (sponsor as any).boothsCount?.toString() || '-',
            sponsor.contractValue ? `R$ ${(sponsor.contractValue / 100).toFixed(2)}` : '-',
          ]);
        }

        console.log(table.toString());
      } catch (err: unknown) {
        spinner.fail('Failed to load sponsors');
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.log(chalk.red(`✗ ${message}`));
        process.exit(1);
      }
    });

  cmd
    .command('create')
    .description('Add a sponsor to an event')
    .argument('<eventId>', 'Event ID')
    .requiredOption('-n, --name <name>', 'Sponsor name')
    .option('-d, --description <description>', 'Description')
    .option('-w, --website <url>', 'Website URL')
    .requiredOption('-t, --tier <tier>', 'Sponsor tier (platinum/gold/silver/bronze/partner)')
    .option('-c, --contact-name <name>', 'Contact name')
    .option('-e, --contact-email <email>', 'Contact email')
    .option('-v, --contract-value <value>', 'Contract value in cents')
    .action(async (eventId: string, options) => {
      const spinner = ora('Creating sponsor...').start();
      try {
        const client = getClient();
        const sponsor = await client.sponsors.create(eventId, {
          name: options.name,
          description: options.description,
          websiteUrl: options.website,
          tier: options.tier,
          contactName: options.contactName,
          contactEmail: options.contactEmail,
          contractValue: options.contractValue ? parseInt(options.contractValue) : undefined,
        });
        spinner.succeed(chalk.green('Sponsor created'));
        console.log(`  ID: ${chalk.cyan(sponsor.id)}`);
      } catch (err: unknown) {
        spinner.fail('Failed to create sponsor');
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.log(chalk.red(`✗ ${message}`));
        process.exit(1);
      }
    });

  cmd
    .command('booths')
    .description('List sponsor booths for an event')
    .argument('<eventId>', 'Event ID')
    .action(async (eventId: string) => {
      const spinner = ora('Loading booths...').start();
      try {
        const client = getClient();
        const booths = await client.sponsors.listBooths(eventId);
        spinner.stop();

        if (booths.length === 0) {
          console.log(chalk.yellow('No booths found'));
          return;
        }

        const table = new Table({
          head: ['Booth', 'Sponsor', 'Location', 'Check-ins', 'Leads'],
          style: { head: ['cyan'] },
        });

        for (const booth of booths) {
          table.push([
            booth.name,
            booth.sponsors?.name || '-',
            booth.location || '-',
            booth.checkinsCount.toString(),
            booth.leadsCollected.toString(),
          ]);
        }

        console.log(table.toString());
      } catch (err: unknown) {
        spinner.fail('Failed to load booths');
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.log(chalk.red(`✗ ${message}`));
        process.exit(1);
      }
    });

  return cmd;
}

function tierBadge(tier: string): string {
  const colors: Record<string, (s: string) => string> = {
    platinum: chalk.cyan,
    gold: chalk.yellow,
    silver: chalk.gray,
    bronze: chalk.red,
    partner: chalk.blue,
  };
  return (colors[tier] || chalk.white)(tier);
}
