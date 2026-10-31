import { ShapeFactory } from '../domain/ShapeFactory.js';
import { EditorContext } from '../application/EditorContext.js';
import { EditorApplication } from '../application/EditorApplication.js';
import { SvgXmlCodec } from '../infrastructure/SvgXmlCodec.js';
import { NodeFileGateway } from '../infrastructure/NodeFileGateway.js';
import { CliRunner } from './CliRunner.js';

const shapes = new ShapeFactory();
const context = new EditorContext(new NodeFileGateway(), new SvgXmlCodec(shapes), shapes);
const script = process.argv.includes('--script');
const failed = await new CliRunner(new EditorApplication(context)).start(process.stdin, process.stdout, script);
if (script && failed) process.exitCode = 1;
