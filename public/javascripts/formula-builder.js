let filters = [
    {
        id: 'cityId',
        label: 'City',
        type: 'text',
        input: 'select',
        values: {
            '1000': 'Hà Nội',
            '2001': 'Đà Nẵng',
            '3003': 'TP Hồ Chí Minh',
        },
    }, {
        id: 'districtId',
        label: 'District',
        type: 'text',
        input: 'select',
        values: {
            '100001': 'Quận Cầu Giấy, TP Hà Nội',
            '200001': 'Quận Hoàn Kiếm, TP Hà Nội',
            '300001': 'Quận Nam Từ Liêm, TP Hà Nội',
            '400001': 'Quận Hai Bà Trưng, TP Hà Nội',
        },
    }, {
        id: 'inStock',
        label: 'In stock',
        type: 'number',
        input: 'radio',
        values: {
            1: 'Yes',
            0: 'No'
        },
        operators: ['equal']
    }, {
        id: 'price',
        label: 'Price',
        type: 'number',
        validation: {
            min: 0,
            step: 0.01
        }
    }, {
        id: 'id',
        label: 'Identifier',
        type: 'text',
        placeholder: '____-____-____',
        operators: ['equal', 'not_equal'],
        validation: {
            format: /^.{4}-.{4}-.{4}$/
        }
    }]

// $('#builder-basic').queryBuilder({
//     plugins: ['bt-tooltip-errors'],
//     filters: filters,
//     rules: rules_basic
// });

const builderContainer = $('#formula-builder');
let ruleCount = 0;
let rulesGroupCount = 0;
const operators = [
    {
        id: 'equal',
        label: 'equal',
        value: '===',
        type: 'all',
    },
    {
        id: 'notEqual',
        label: 'not equal',
        value: '!==',
        type: 'all'
    },
    // {
    //     id: 'in',
    //     label: 'in',
    //     input: 'select'
    // },
    // {
    //     id: 'notIn',
    //     label: 'not in',
    //     input: 'select'
    // },
    {
        id: 'less',
        label: 'less',
        value: '<',
        type: 'number'
    },
    {
        id: 'lessOrEqual',
        label: 'less or equal',
        value: '<=',
        type: 'number'
    },
    {
        id: 'greater',
        label: 'greater',
        value: '>',
        type: 'number'
    },
    {
        id: 'greaterOrEqual',
        label: 'greater or equal',
        value: '>=',
        type: 'number'
    },
    {
        id: 'before',
        label: 'before',
        value: '<',
        type: 'date'
    },
    {
        id: 'notBefore',
        label: 'not before',
        value: '>=',
        type: 'date'
    },
    {
        id: 'after',
        label: 'after',
        value: '>',
        type: 'date'
    },
    {
        id: 'notAfter',
        label: 'not after',
        value: '<=',
        type: 'date'
    },
    {
        id: 'isNull',
        label: 'is null',
        value: '==null',
        type: 'all'
    },
    {
        id: 'isNotNull',
        label: 'is not null',
        value: '!=null',
        type: 'all'
    },
]
let filterOptions = '';
filters.forEach(filter => filterOptions += `<option value="${filter.id}">${filter.label}</option>`);

insertRule = (filter, operator, value) => {
    let operatorContent = '';
    let valueContent = '';
    if (filter && operator && value) {
        operatorContent = insertOperators(filters.find(a => a.id === filter));
        valueContent = insertValues(filters.find(a => a.id === filter));
    }
    let content = `
                                <div id="rule-${ruleCount}" class="rule-container">
                                    <div class="rule-header">
                                        <div class="btn-group float-right rule-actions">
                                            <button type="button" class="btn btn-xs btn-danger delete-rule">
                                                <i class="fas fa-times"></i> Delete
                                            </button>
                                        </div>
                                    </div>
                                    <div class="rule-filter-container">
                                        <select name="rule-filter" class="form-control">
                                            <option value disabled selected hidden>------</option>
                                            ${filterOptions}
                                        </select>
                                    </div>
                                    <div class="rule-operator-container">${operatorContent}</div>
                                    <div class="rule-value-container">${valueContent}</div>
                                </div>`;
    ruleCount++;
    return content;
}

insertRulesGroup = (logic, rulesList, rules, groups) => {
    let logicContent = 'AND';
    if (logic && logic === '||') {
        logicContent = 'OR';
    }
    let rulesListContent = '';
    if (rulesList && rulesList.length) {
        rulesList.forEach(item => {
            if (item[0] === 'r') {
                let rule = rules[Number(item.slice(1))];
                insertRule()
            }
        })
    }
    let content = `<div id="rules-group-${rulesGroupCount}" class="rules-group-container">
                                    <div class="rules-group-header">
                                        <div class="btn-group float-right group-actions">
                                            <button type="button" class="btn btn-xs btn-success add-rule">
                                                <i class="fas fa-plus"></i> Add rule
                                            </button>
                                            <button type="button" class="btn btn-xs btn-success add-group">
                                                <i class="fas fa-plus-circle"></i> Add group
                                            </button>
                                            <button type="button" class="btn btn-xs btn-danger delete-group">
                                                <i class="fas fa-times"></i> Delete
                                            </button>
                                        </div>
                                        <div class="btn-group group-logics">
                                            <label class="btn btn-xs btn-primary disabled ${logicContent === 'AND' ? 'active' : ''}">
                                                <input type="radio" name="rules-group-${rulesGroupCount}-logic" value="AND" ${logicContent === 'AND' ? 'checked' : ''}> AND </label>
                                            <label class="btn btn-xs btn-primary disabled ${logicContent === 'OR' ? 'active' : ''}">
                                                <input type="radio" name="rules-group-${rulesGroupCount}-logic" value="OR" ${logicContent === 'OR' ? 'checked' : ''}> OR </label>
                                        </div>
                                    </div>
                                    <div class="rules-group-body">
                                        <div class="rules-list">
                                            ${insertRule()}
                                        </div>
                                    </div>
                                </div>`;
    rulesGroupCount++;
    return content;
}

insertOperators = filter => {
    let operatorOptions = '';
    operators.filter(item => item.type === filter.type || item.type === 'all' || (filter.input && item.input === filter.input)).forEach(operator => {
        operatorOptions += `<option value="${operator.id}">${operator.label}</option>`
    })
    return `<select name="rule-operator" class="form-control">${operatorOptions}</select>`
}

insertValues = filter => {
    let valueOptions = '';
    if (filter.input === 'select' && filter.values) {
        for (let x in filter.values) {
            valueOptions += `<option value="${x}">${filter.values[x]}</option>`
        }
        return `<select class="form-control" name="rule-value">${valueOptions}</select>`
    } else {
        return `<input class="form-control" name="rule-value" type="${filter.type}">`
    }
}

builderContainer.click(event => {
    if ($(event.target).parent().hasClass('group-logics')) {
        $(event.target).addClass('active').siblings().removeClass('active');
    }
    if ($(event.target).hasClass('add-rule')) {
        $(event.target).closest('.rules-group-container').find('.rules-list').first().append(insertRule());
    }
    if ($(event.target).hasClass('add-group')) {
        $(event.target).closest('.rules-group-container').find('.rules-list').first().append(insertRulesGroup());
    }
    if ($(event.target).hasClass('delete-rule')) {
        $(event.target).closest('.rule-container').remove();
    }
    if ($(event.target).hasClass('delete-group')) {
        $(event.target).closest('.rules-group-container').remove();
    }
    $('.rules-list').each(function () {
        if ($(this).children().length > 1) {
            $(this).closest('.rules-group-container').find('.group-logics').first().find('label').removeClass('disabled');
        } else {
            $(this).closest('.rules-group-container').find('.group-logics').first().find('label').addClass('disabled');
        }
    })
})

builderContainer.on('change', '[name="rule-filter"]', function () {
    let filter = filters.find(a => a.id === $(this).val());
    $(this).parent().siblings('.rule-operator-container').html(insertOperators(filter));
    $(this).parent().siblings('.rule-value-container').html(insertValues(filter));
});

(function ($) {
    $.fn.exportCondition = function () {
        if ($(this).hasClass('rules-group-container')) {
            let rulesGroupId = $(this).attr('id').slice(12);
            let logic = $(this).find(`input[name="rules-group-${rulesGroupId}-logic"]:checked`).val() === 'AND' ? '&&' : '||';
            let rulesList = $(this).find(`.rules-list`).first().children();
            let rules = [];
            $(rulesList).each(function(index, item) {
                rules.push($(item).exportCondition());
            })
            return `(${rules.join(` ${logic} `)})`;
        } else if ($(this).hasClass('rule-container')) {
            let filter = $(this).find('[name="rule-filter"]').val();
            let operator = $(this).find('[name="rule-operator"]').val();
            let value = $(this).find('[name="rule-value"]').val();
            if (operator === 'equal') {
                return `${filter} === ${value}`
            } else if (operator === 'notEqual') {
                return `${filter} !== ${value}`
            } else if (operator === 'isNull') {
                return `${filter} == null`
            } else if (operator === 'isNotNull') {
                return `${filter} != null`
            } else if (operator === 'less') {
                return `${filter} < ${value}`
            } else if (operator === 'lessOrEqual') {
                return `${filter} <= ${value}`
            } else if (operator === 'greater') {
                return `${filter} > ${value}`
            } else if (operator === 'greaterOrEqual') {
                return `${filter} >= ${value}`
            } else if (operator === 'before') {
                return `${filter} < ${value}`
            } else if (operator === 'notAfter') {
                return `${filter} <= ${value}`
            } else if (operator === 'after') {
                return `${filter} > ${value}`
            } else if (operator === 'notBefore') {
                return `${filter} >= ${value}`
            } else {
                $.error('Invalid operator');
            }
        } else {
            $.error('Not a rule or rules group container');
        }
    };
    $.fn.importCondition = function (condition) {
        let rules = [];
        let groups = [];
        // Remove all spaces
        condition = condition.replace(/\s/g, '');
        // Find all rules and put into an array called rules
        condition.match(/([^()|&]+)/g).forEach((item, index) => {
            rules.push(item);
            condition = condition.replace(item, `r${index}`);
        })
        console.log(condition);
        // Find all rules groups and put into an array called groups
        function convertToGroups() {
            let deepestBrackets = condition.match(/\(([^()]+)\)/g);
            if (deepestBrackets && deepestBrackets.length) {
                deepestBrackets.forEach(item => {
                    if (item.indexOf('&&') !== -1 && item.indexOf('||') !== -1) {
                        let andParts = item.match(/([^()|]+)/g).filter(a => a.indexOf('&&') !== -1);
                        condition = condition.replace(item, item.replace(andParts, `(${andParts})`));
                        convertToGroups();
                    } else {
                        condition = condition.replace(item, `g${groups.length}`);
                        groups.push({
                            logic: item.indexOf('||') !== -1 ? 'OR' : 'AND',
                            rulesList: item.indexOf('||') !== -1 ? item.slice(1,-1).split('||') : item.slice(1,-1).split('&&')
                        });
                    }
                })
                convertToGroups();
            } else if (condition.indexOf('&&') !== -1 && condition.indexOf('||') !== -1) {
                let andParts = condition.match(/([^()|]+)/g).filter(a => a.indexOf('&&') !== -1);
                condition = condition.replace(andParts, `(${andParts})`);
                convertToGroups();
            } else if (condition.indexOf('&&') !== -1 || condition.indexOf('||') !== -1) {
                condition = `(${condition})`;
                convertToGroups();
            } else {
                // if (rules && groups && groups.length) {
                //     for (let i = groups.length - 1; i >= 0; i--) {
                //         groups[i]
                //     }
                // }
                rules.forEach(item => {
                    let operatorValues = operators.map(a => a.value);

                })
                console.log(condition);
                console.log(rules);
                console.log(groups);
                insertRulesGroup(rules, groups);
            }
        }
        convertToGroups();
    }
})(jQuery);


let savedCondition = '';
$('.save-formula').click(function () {
    let condition = builderContainer.find('#rules-group-0').exportCondition();
    savedCondition = condition;
    console.log(condition);
})
startFormulaBuilder = () => {
    builderContainer.addClass('form-inline').append(insertRulesGroup());
    $('#rules-group-0').find('.delete-group').first().remove();
};

startFormulaBuilder();

// *** IMPORT CONDITION
$('.import-formula').click(function () {
    const sampleFormula = '((districtId === 100001) || (districtId === 100001) || districtId === 100001) && cityId === 1000 && districtId === 100001 && (inStock === 1 || inStock === 2 && (districtId === 100001)) && price === 18';
    builderContainer.importCondition(sampleFormula);
})

const parsed = [
    {
        filter: 'cityId',
        operators: 'equal',
        value: '1000'
    },
    {
        filter: 'districtId',
        operators: 'equal',
        value: '100001'
    },
    [
        {
            filter: 'inStock',
            operator: 'equal',
            value: '10'
        },
        {
            filter: 'price',
            operator: 'equal',
            value: '99'
        }
    ]
]