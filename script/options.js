/**
 * Created by daijong.kim on 8/22/16.
 */
$(document).ready(function() {
    var _hosts = [];
    chrome.storage.sync.get('telNumber', function(res) {
        var data = res['telNumber'] || ''
            ,telNumber = data
            ;
        $('#myPhone').val(telNumber);
    });
    $('div#search').on('click','#btnSaveOption', function() {
        var phone = $('#myPhone')
            ;
        chrome.storage.sync.set({'telNumber': phone.val()}, function() {
            alert('Settings saved');
        });
    }).on('click','#btnHostAdd', function() {
        var data = $('#addHost')
        ;
        console.log(data);
        chrome.storage.sync.set({'hosts': data.val()}, function() {
            alert('Settings saved');
        });
    });
});
