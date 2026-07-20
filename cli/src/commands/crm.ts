import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import ora from 'ora';
import { EventOSClient } from '@eventos-ai/sdk';

export function crmCommand(getClient: () => EventOSClient): Command {
  const cmd = new Command('crm').description('Manage CRM');

  cmd
    .command('pipelines')
    .description('List CRM pipelines')
    .action(async () => {
      const spinner = ora('Loading pipelines...').start();
      try {
        const client = getClient();
        const pipelines = await client.crm.listPipelines();
        spinner.stop();

        if (pipelines.length === 0) {
          console.log(chalk.yellow('No pipelines found'));
          return;
        }

        for (const pipeline of pipelines) {
          console.log(chalk.bold(`\n${pipeline.name} ${pipeline.isDefault ? chalk.dim('(default)') : ''}`));
          console.log(chalk.dim(`  ${pipeline.description || ''}`));

          const stageTable = new Table({
            head: ['Stage', 'Deals', 'Value', 'Probability'],
            style: { head: ['cyan'] },
          });

          for (const stage of pipeline.stages) {
            stageTable.push([
              stage.name,
              stage.dealsCount.toString(),
              stage.totalValue ? `R$ ${(stage.totalValue / 100).toFixed(2)}` : '-',
              `${stage.probability}%`,
            ]);
          }

          console.log(stageTable.toString());
        }
      } catch (err: unknown) {
        spinner.fail('Failed to load pipelines');
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.log(chalk.red(`✗ ${message}`));
        process.exit(1);
      }
    });

  cmd
    .command('deals')
    .description('List deals in a pipeline')
    .argument('<pipelineId>', 'Pipeline ID')
    .option('-s, --stage <stageId>', 'Filter by stage')
    .option('-p, --page <page>', 'Page number', '1')
    .option('-l, --limit <limit>', 'Items per page', '20')
    .action(async (pipelineId: string, options) => {
      const spinner = ora('Loading deals...').start();
      try {
        const client = getClient();
        const res = await client.crm.listDeals(pipelineId, {
          stageId: options.stage,
          page: parseInt(options.page),
          limit: parseInt(options.limit),
        });
        spinner.stop();

        if (res.data.length === 0) {
          console.log(chalk.yellow('No deals found'));
          return;
        }

        const table = new Table({
          head: ['Title', 'Value', 'Stage', 'Status'],
          style: { head: ['cyan'] },
        });

        for (const deal of res.data) {
          table.push([
            deal.title.slice(0, 30),
            `R$ ${(deal.value / 100).toFixed(2)}`,
            deal.contact?.name || '-',
            deal.status,
          ]);
        }

        console.log(table.toString());
        console.log(chalk.dim(`\n${res.total} total deals`));
      } catch (err: unknown) {
        spinner.fail('Failed to load deals');
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.log(chalk.red(`✗ ${message}`));
        process.exit(1);
      }
    });

  cmd
    .command('contacts')
    .description('List CRM contacts')
    .option('-s, --search <query>', 'Search contacts')
    .option('-p, --page <page>', 'Page number', '1')
    .option('-l, --limit <limit>', 'Items per page', '20')
    .action(async (options) => {
      const spinner = ora('Loading contacts...').start();
      try {
        const client = getClient();
        const res = await client.crm.listContacts({
          search: options.search,
          page: parseInt(options.page),
          limit: parseInt(options.limit),
        });
        spinner.stop();

        if (res.data.length === 0) {
          console.log(chalk.yellow('No contacts found'));
          return;
        }

        const table = new Table({
          head: ['Name', 'Email', 'Company', 'Deals', 'Revenue'],
          style: { head: ['cyan'] },
        });

        for (const contact of res.data) {
          table.push([
            contact.name.slice(0, 25),
            contact.email.slice(0, 25),
            contact.company?.slice(0, 15) || '-',
            contact.dealsCount.toString(),
            contact.totalRevenue ? `R$ ${(contact.totalRevenue / 100).toFixed(2)}` : '-',
          ]);
        }

        console.log(table.toString());
        console.log(chalk.dim(`\n${res.total} total contacts`));
      } catch (err: unknown) {
        spinner.fail('Failed to load contacts');
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.log(chalk.red(`✗ ${message}`));
        process.exit(1);
      }
    });

  return cmd;
}
