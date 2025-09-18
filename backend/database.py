import boto3
import os
from botocore.exceptions import ClientError
from datetime import datetime
import uuid

# DynamoDB setup
dynamodb_endpoint = os.getenv('DYNAMODB_ENDPOINT', 'http://localhost:8000')
dynamodb = boto3.resource('dynamodb', endpoint_url=dynamodb_endpoint, region_name='us-west-2')
dynamodb_client = boto3.client('dynamodb', endpoint_url=dynamodb_endpoint, region_name='us-west-2')

async def init_db():
    """Initialize DynamoDB tables"""
    tables_to_create = [
        {
            'TableName': 'boards',
            'KeySchema': [
                {'AttributeName': 'id', 'KeyType': 'HASH'}
            ],
            'AttributeDefinitions': [
                {'AttributeName': 'id', 'AttributeType': 'S'}
            ],
            'BillingMode': 'PAY_PER_REQUEST'
        },
        {
            'TableName': 'columns',
            'KeySchema': [
                {'AttributeName': 'id', 'KeyType': 'HASH'}
            ],
            'AttributeDefinitions': [
                {'AttributeName': 'id', 'AttributeType': 'S'},
                {'AttributeName': 'board_id', 'AttributeType': 'S'}
            ],
            'GlobalSecondaryIndexes': [
                {
                    'IndexName': 'board_id-index',
                    'KeySchema': [
                        {'AttributeName': 'board_id', 'KeyType': 'HASH'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'}
                }
            ],
            'BillingMode': 'PAY_PER_REQUEST'
        },
        {
            'TableName': 'tickets',
            'KeySchema': [
                {'AttributeName': 'id', 'KeyType': 'HASH'}
            ],
            'AttributeDefinitions': [
                {'AttributeName': 'id', 'AttributeType': 'S'},
                {'AttributeName': 'column_id', 'AttributeType': 'S'}
            ],
            'GlobalSecondaryIndexes': [
                {
                    'IndexName': 'column_id-index',
                    'KeySchema': [
                        {'AttributeName': 'column_id', 'KeyType': 'HASH'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'}
                }
            ],
            'BillingMode': 'PAY_PER_REQUEST'
        }
    ]
    
    for table_config in tables_to_create:
        try:
            table = dynamodb_client.create_table(**table_config)
            print(f"Created table: {table_config['TableName']}")
        except ClientError as e:
            if e.response['Error']['Code'] == 'ResourceInUseException':
                print(f"Table {table_config['TableName']} already exists")
            else:
                print(f"Error creating table {table_config['TableName']}: {e}")

async def seed_data():
    """Seed initial data"""
    boards_table = dynamodb.Table('boards')
    columns_table = dynamodb.Table('columns')
    tickets_table = dynamodb.Table('tickets')
    
    # Check if data already exists
    try:
        response = boards_table.scan(Limit=1)
        if response['Items']:
            print("Data already seeded")
            return
    except:
        pass
    
    # Create default board
    board_id = "default-board"
    board_data = {
        'id': board_id,
        'name': 'Opus1 Task Board',
        'created_at': datetime.utcnow().isoformat(),
    }
    boards_table.put_item(Item=board_data)
    
    # Create default columns
    columns_data = [
        {'id': 'col-1', 'board_id': board_id, 'name': 'To Do', 'position': 0},
        {'id': 'col-2', 'board_id': board_id, 'name': 'In Progress', 'position': 1},
        {'id': 'col-3', 'board_id': board_id, 'name': 'Done', 'position': 2}
    ]
    
    for col in columns_data:
        col['created_at'] = datetime.utcnow().isoformat()
        columns_table.put_item(Item=col)
    
    # Create sample tickets
    tickets_data = [
        {'id': 'ticket-1', 'column_id': 'col-1', 'title': 'Prompt LLM to init', 'description': 'Use bolt.new to provide quick greenfield project', 'position': 0},
        {'id': 'ticket-2', 'column_id': 'col-1', 'title': 'Make adjustments', 'description': 'Adjust LLM code where appropriate', 'position': 1},
        {'id': 'ticket-3', 'column_id': 'col-2', 'title': 'Go for a walk', 'description': 'Grab some water, too', 'position': 0},
        {'id': 'ticket-4', 'column_id': 'col-3', 'title': 'Prompt LLM to write test cases', 'description': 'Use bolt.new for initial tests', 'position': 0},
        {'id': 'ticket-5', 'column_id': 'col-3', 'title': 'Fix LLMS test cases', 'description': 'Struggling with best practices', 'position': 1},
        {'id': 'ticket-6', 'column_id': 'col-3', 'title': 'Test e2e', 'description': 'Dont forget different browsers', 'position': 2},
        {'id': 'ticket-7', 'column_id': 'col-3', 'title': 'Document work', 'description': 'Include next steps & tech debt', 'position': 3}
    ]
    
    for ticket in tickets_data:
        ticket['created_at'] = datetime.utcnow().isoformat()
        tickets_table.put_item(Item=ticket)
    
    print("Seeded initial data successfully")

def get_tables():
    tables = dynamodb_client.list_tables()
    if 'TableNames' in tables:
        return tables
    else:
        return []
"""
BOARDS - create all CRUD operations for boards
"""
def get_boards():
    table = dynamodb.Table('boards')
    response = table.scan()
    return response['Items']

def get_board(board_id):
    table = dynamodb.Table('boards')
    response = table.get_item(Key={'id': board_id})
    return response.get('Item')

def update_board(board_id, name):
    table = dynamodb.Table('boards')
    response = table.update_item(
        Key={'id': board_id},
        UpdateExpression='SET #name = :name',
        ExpressionAttributeNames={'#name': 'name'},
        ExpressionAttributeValues={':name': name},
        ReturnValues='ALL_NEW'
    )
    return response['Attributes']

def create_board(name, id=None):
    if not id:
        id = str(uuid.uuid4())
    table = dynamodb.Table('boards')
    item = {
        'id': id,
        'name': name,
        'created_at': datetime.utcnow().isoformat()
    }
    table.put_item(Item=item)
    return item

def delete_board(board_id):
    # First get all columns in this board delete all tickets in  column
    columns_table = dynamodb.Table('columns')
    boards_table = dynamodb.Table('boards')

    column_data = columns_table.query(
        IndexName='board_id-index',
        KeyConditionExpression=boto3.dynamodb.conditions.Key('board_id').eq(board_id)
    )
    # loop thru column data to get ticket data/column, delete tickets, then delete column, then delete board
    if 'Items' in column_data and column_data['Items']:
        for column in column_data['Items']:
            delete_column(column['id'])

    boards_table.delete_item(Key={'id': board_id})
    return True

"""
COLUMNS - CRUD operations for columns table
"""
def get_columns_by_board(board_id):
    table = dynamodb.Table('columns')
    response = table.query(
        IndexName='board_id-index',
        KeyConditionExpression=boto3.dynamodb.conditions.Key('board_id').eq(board_id)
    )
    items = response['Items']
    return sorted(items, key=lambda x: x['position'])

def create_column(board_id, name, position):
    table = dynamodb.Table('columns')
    column_id = str(uuid.uuid4())
    item = {
        'id': column_id,
        'board_id': board_id,
        'name': name,
        'position': position,
        'created_at': datetime.utcnow().isoformat()
    }
    table.put_item(Item=item)
    return item

def update_column(column_id, name=None, position=None):
    table = dynamodb.Table('columns')
    update_expression = []
    expression_values = {}
    expression_names = {}
    
    if name is not None:
        update_expression.append('#name = :name')
        expression_names['#name'] = 'name'
        expression_values[':name'] = name
    
    if position is not None:
        update_expression.append('#position = :position')
        expression_names['#position'] = 'position'
        expression_values[':position'] = position
    
    response = table.update_item(
        Key={'id': column_id},
        UpdateExpression='SET ' + ', '.join(update_expression),
        ExpressionAttributeNames=expression_names,
        ExpressionAttributeValues=expression_values,
        ReturnValues='ALL_NEW'
    )
    return response['Attributes']

def delete_column(column_id):
    # First delete all tickets in this column
    tickets_table = dynamodb.Table('tickets')
    response = tickets_table.query(
        IndexName='column_id-index',
        KeyConditionExpression=boto3.dynamodb.conditions.Key('column_id').eq(column_id)
    )
    
    for ticket in response['Items']:
        tickets_table.delete_item(Key={'id': ticket['id']})
    
    # Then delete the column
    columns_table = dynamodb.Table('columns')
    columns_table.delete_item(Key={'id': column_id})
    return True

"""
TICKETS - CRUD operations for tickets table
"""

def get_tickets_by_column(column_id):
    table = dynamodb.Table('tickets')
    response = table.query(
        IndexName='column_id-index',
        KeyConditionExpression=boto3.dynamodb.conditions.Key('column_id').eq(column_id)
    )
    items = response['Items']
    return sorted(items, key=lambda x: x['position'])

def create_ticket(column_id, title, description, position):
    table = dynamodb.Table('tickets')
    ticket_id = str(uuid.uuid4())
    item = {
        'id': ticket_id,
        'column_id': column_id,
        'title': title,
        'description': description,
        'position': position,
        'created_at': datetime.utcnow().isoformat()
    }
    table.put_item(Item=item)
    return item

def update_ticket(ticket_id, title=None, description=None, column_id=None, position=None):
    table = dynamodb.Table('tickets')
    update_expression = []
    expression_values = {}
    expression_names = {}
    
    if title is not None:
        update_expression.append('#title = :title')
        expression_names['#title'] = 'title'
        expression_values[':title'] = title
    
    if description is not None:
        update_expression.append('#description = :description')
        expression_names['#description'] = 'description'
        expression_values[':description'] = description
    
    if column_id is not None:
        update_expression.append('column_id = :column_id')
        expression_values[':column_id'] = column_id
    
    if position is not None:
        update_expression.append('#position = :position')
        expression_names['#position'] = 'position'
        expression_values[':position'] = position
    
    response = table.update_item(
        Key={'id': ticket_id},
        UpdateExpression='SET ' + ', '.join(update_expression),
        ExpressionAttributeNames=expression_names,
        ExpressionAttributeValues=expression_values,
        ReturnValues='ALL_NEW'
    )
    return response['Attributes']

def delete_ticket(ticket_id):
    table = dynamodb.Table('tickets')
    table.delete_item(Key={'id': ticket_id})
    return True

def get_all_tickets_by_board(board_id):
    """Get all tickets for a board by first getting all columns, then all tickets"""
    columns = get_columns_by_board(board_id)
    all_tickets = []
    
    for column in columns:
        tickets = get_tickets_by_column(column['id'])
        all_tickets.extend(tickets)
    
    return all_tickets