import { Pipeline, Stage } from '../entities/pipeline.entity';

describe('Pipeline Entity', () => {
  const now = new Date('2024-01-01');

  const createStage = (id: string, name: string, position: number): Stage =>
    new Stage(id, name, position, null, 0, now);

  const createPipeline = (stages: Stage[] = []): Pipeline =>
    new Pipeline('p1', 'org1', 'Sales Pipeline', null, stages, now, now);

  it('should create pipeline with stages', () => {
    const stages = [createStage('s1', 'Lead', 0), createStage('s2', 'Qualified', 1)];
    const pipeline = createPipeline(stages);
    expect(pipeline.id).toBe('p1');
    expect(pipeline.name).toBe('Sales Pipeline');
    expect(pipeline.stages).toHaveLength(2);
    expect(pipeline.stages[0].name).toBe('Lead');
    expect(pipeline.stages[1].name).toBe('Qualified');
  });

  it('should add stage', () => {
    const pipeline = createPipeline();
    const stage = createStage('s1', 'Lead', 0);
    pipeline.addStage(stage);
    expect(pipeline.stages).toHaveLength(1);
    expect(pipeline.stages[0].name).toBe('Lead');
  });

  it('should validate max stages (10)', () => {
    const stages = Array.from({ length: 10 }, (_, i) =>
      createStage(`s${i}`, `Stage ${i}`, i),
    );
    const pipeline = createPipeline(stages);
    expect(() => pipeline.addStage(createStage('s11', 'Extra', 11))).toThrow(
      'Maximum number of stages (10) reached',
    );
  });

  it('should not allow duplicate stage names', () => {
    const pipeline = createPipeline();
    pipeline.addStage(createStage('s1', 'Lead', 0));
    expect(() => pipeline.addStage(createStage('s2', 'Lead', 1))).toThrow(
      'Stage with name "Lead" already exists',
    );
  });

  it('should remove stage', () => {
    const pipeline = createPipeline([
      createStage('s1', 'Lead', 0),
      createStage('s2', 'Qualified', 1),
    ]);
    pipeline.removeStage('s1');
    expect(pipeline.stages).toHaveLength(1);
    expect(pipeline.stages[0].id).toBe('s2');
  });

  it('should throw when removing non-existent stage', () => {
    const pipeline = createPipeline();
    expect(() => pipeline.removeStage('nonexistent')).toThrow('Stage not found');
  });

  it('should reorder stages', () => {
    const stages = [
      createStage('s1', 'Lead', 0),
      createStage('s2', 'Qualified', 1),
      createStage('s3', 'Closed', 2),
    ];
    const pipeline = createPipeline(stages);
    pipeline.reorderStages(['s3', 's1', 's2']);
    expect(pipeline.stages[0].id).toBe('s3');
    expect(pipeline.stages[0].position).toBe(0);
    expect(pipeline.stages[1].id).toBe('s1');
    expect(pipeline.stages[1].position).toBe(1);
    expect(pipeline.stages[2].id).toBe('s2');
    expect(pipeline.stages[2].position).toBe(2);
  });

  it('should throw on reorder with missing stage id', () => {
    const pipeline = createPipeline([createStage('s1', 'Lead', 0)]);
    expect(() => pipeline.reorderStages(['s1', 'invalid'])).toThrow(
      'Stage "invalid" not found in pipeline',
    );
  });

  it('should throw on reorder with mismatched count', () => {
    const pipeline = createPipeline([createStage('s1', 'Lead', 0)]);
    expect(() => pipeline.reorderStages([])).toThrow(
      'Provided stage IDs do not match pipeline stages',
    );
  });
});
